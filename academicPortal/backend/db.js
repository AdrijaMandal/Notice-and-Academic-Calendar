const mongoose = require('mongoose');
const dns = require('dns');
const { URL, URLSearchParams } = require('url');

async function resolveSrvRecord(name) {
  const resolver = dns.promises;
  try {
    return await resolver.resolveSrv(name);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEOUT') {
      const fallbackResolver = new dns.Resolver();
      fallbackResolver.setServers(['8.8.8.8', '1.1.1.1']);
      return new Promise((resolve, reject) => {
        fallbackResolver.resolveSrv(name, (resolveErr, addresses) => {
          if (resolveErr) return reject(resolveErr);
          resolve(addresses);
        });
      });
    }
    throw err;
  }
}

function ensurePublicDnsForSrv() {
  const servers = dns.getServers();
  const shouldReplace = servers.length > 0 && servers.every((server) => server === '127.0.0.1' || server === '::1' || /^127\./.test(server));
  if (shouldReplace) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.warn('Using public DNS servers for SRV resolution:', dns.getServers());
  }
}

async function buildFallbackUri(uri) {
  if (!uri.startsWith('mongodb+srv://')) return null;

  const parsed = new URL(uri);
  const username = parsed.username ? decodeURIComponent(parsed.username) : null;
  const password = parsed.password ? decodeURIComponent(parsed.password) : null;
  const host = parsed.hostname;
  const dbName = parsed.pathname && parsed.pathname.length > 1 ? parsed.pathname.slice(1) : 'admin';
  const params = new URLSearchParams(parsed.searchParams);

  const srvName = `_mongodb._tcp.${host}`;
  const records = await resolveSrvRecord(srvName);
  if (!records.length) return null;

  const addresses = records.map((record) => `${record.name}:${record.port}`);
  const firstHost = records[0].name;
  const replicaSet = getReplicaSetName(firstHost);

  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
  if (!params.has('ssl')) params.set('ssl', 'true');
  if (replicaSet && !params.has('replicaSet')) params.set('replicaSet', replicaSet);
  if (!params.has('authSource')) params.set('authSource', 'admin');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');

  const authPart = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
  return `mongodb://${authPart}${addresses.join(',')}/${dbName}?${params.toString()}`;
}

function getReplicaSetName(hostname) {
  const match = hostname.match(/^(.+)-00-\d+\./);
  if (!match) return null;
  return `${match[1]}-0`;
}

async function connectDatabase(uri, fallbackUri = null) {
  mongoose.set('strictQuery', false);

  if (uri.startsWith('mongodb+srv://')) {
    ensurePublicDnsForSrv();
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    appName: 'AcademicPortal',
  };

  try {
    await mongoose.connect(uri, options);
    return mongoose.connection;
  } catch (err) {
    console.warn('Primary connection failed:', err.message || err);

    if (fallbackUri) {
      try {
        console.warn('Trying explicit fallback URI from MONGO_URI_FALLBACK');
        await mongoose.connect(fallbackUri, options);
        return mongoose.connection;
      } catch (fallbackErr) {
        console.warn('Fallback URI connection failed:', fallbackErr.message || fallbackErr);
      }
    }

    const shouldFallback = err.message && err.message.includes('querySrv');
    if (!shouldFallback) throw err;

    const fallbackFromSrv = await buildFallbackUri(uri);
    if (!fallbackFromSrv) throw err;

    console.warn('MongoDB SRV lookup failed; trying fallback URI derived from SRV hosts:', fallbackFromSrv);
    await mongoose.connect(fallbackFromSrv, options);
    return mongoose.connection;
  }
}

module.exports = { connectDatabase, buildFallbackUri };

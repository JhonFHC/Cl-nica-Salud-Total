/* ============================================
   ClinicaSoft - Conexión Supabase
   ============================================ */

const SUPABASE_URL = 'https://ovmvatdwaruvohvhpozh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__OV1fl0xO9E89fgOTqELUw_IaI80WXM';

const SupabaseService = (() => {
  let client = null;

  function getClient() {
    if (client) return client;
    if (typeof supabase !== 'undefined') {
      client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return client;
  }

  function isAvailable() {
    return !!getClient();
  }

  /* --- Auth --- */
  async function signIn(email, password) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase no disponible') };
    return await sb.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    const sb = getClient();
    if (!sb) return;
    await sb.auth.signOut();
  }

  async function getSession() {
    const sb = getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  async function getUser() {
    const sb = getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data.user;
  }

  function onAuthChange(callback) {
    const sb = getClient();
    if (!sb) return;
    sb.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  /* --- Database --- */
  async function select(table, options = {}) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase no disponible') };
    let query = sb.from(table).select(options.select || '*');
    if (options.eq) query = query.eq(options.eq.column, options.eq.value);
    if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending !== false });
    if (options.limit) query = query.limit(options.limit);
    if (options.single) query = query.single();
    return await query;
  }

  async function insert(table, data) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase no disponible') };
    return await sb.from(table).insert(data).select();
  }

  async function update(table, data, match) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase no disponible') };
    return await sb.from(table).update(data).eq(match.column, match.value).select();
  }

  async function remove(table, match) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase no disponible') };
    return await sb.from(table).delete().eq(match.column, match.value);
  }

  return {
    getClient,
    isAvailable,
    signIn,
    signOut,
    getSession,
    getUser,
    onAuthChange,
    select,
    insert,
    update,
    remove
  };
})();

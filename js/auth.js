/* ============================================
   ClinicaSoft - Módulo de Autenticación
   ============================================ */

const Auth = (() => {
  let currentUser = null;
  let useSupabase = false;

  async function init() {
    if (SupabaseService.isAvailable()) {
      const session = await SupabaseService.getSession();
      if (session?.user) {
        useSupabase = true;
        const meta = session.user.user_metadata || {};
        currentUser = {
          id: session.user.id,
          nombre: meta.full_name || meta.name || session.user.email || 'Usuario',
          email: session.user.email,
          rol: meta.rol || 'admin',
          avatar: null,
          supabase: true
        };
        sessionStorage.setItem('clinica_user', JSON.stringify(currentUser));
        return true;
      }
    }
    const stored = sessionStorage.getItem('clinica_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return true;
    }
    return false;
  }

  async function login(email, password) {
    // Try Supabase first
    if (SupabaseService.isAvailable()) {
      const { data, error } = await SupabaseService.signIn(email, password);
      if (!error && data?.user) {
        useSupabase = true;
        const meta = data.user.user_metadata || {};
        const roles = ClinicaData.roles;
        const userRol = meta.rol || (email.includes('admin') ? 'admin' : email.includes('medico') ? 'medico' : email.includes('recepcion') ? 'recepcion' : email.includes('farmacia') ? 'farmacia' : 'admin');
        currentUser = {
          id: data.user.id,
          nombre: meta.full_name || meta.name || data.user.email || 'Usuario',
          email: data.user.email,
          rol: roles[userRol] ? userRol : 'admin',
          avatar: null,
          supabase: true
        };
        sessionStorage.setItem('clinica_user', JSON.stringify(currentUser));
        return currentUser;
      }
    }

    // Fallback: mock users
    const user = ClinicaData.usuarios.find(u => u.email === email && u.password === password);
    if (!user) return null;
    currentUser = { ...user, supabase: false };
    sessionStorage.setItem('clinica_user', JSON.stringify(currentUser));
    return currentUser;
  }

  async function logout() {
    if (useSupabase && SupabaseService.isAvailable()) {
      await SupabaseService.signOut();
    }
    currentUser = null;
    sessionStorage.removeItem('clinica_user');
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getModulos() {
    if (!currentUser) return [];
    const rolData = ClinicaData.roles[currentUser.rol];
    return rolData ? rolData.modulos : [];
  }

  function getRolLabel() {
    if (!currentUser) return '';
    const rolData = ClinicaData.roles[currentUser.rol];
    return rolData ? rolData.label : '';
  }

  function isLoggedIn() {
    return !!currentUser;
  }

  function isUsingSupabase() {
    return useSupabase;
  }

  return { init, login, logout, getCurrentUser, getModulos, getRolLabel, isLoggedIn, isUsingSupabase };
})();

/* ============================================
   ClinicaSoft - Aplicación Principal
   ============================================ */

const App = (() => {
  let currentModule = 'Dashboard';
  let chartInstance = null;

  /* --- Init --- */
  async function init() {
    renderLogin();
    bindLoginEvents();
    await Auth.init();
    if (Auth.isLoggedIn()) {
      enterApp();
    }
  }

  /* === LOGIN === */
  function renderLogin() {
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.innerHTML = `
      <div class="login-box">
        <div class="login-logo">
          <img src="img/logo-clinica.png" alt="ClinicaSoft" class="login-logo-img">
          <h1>ClinicaSoft</h1>
          <p>Sistema de Gestión Clínica</p>
        </div>
        <form class="login-form" id="loginForm">
          <div class="form-group">
            <label for="loginEmail">Correo electrónico</label>
            <input type="email" id="loginEmail" class="form-control" placeholder="ej: admin@clinica.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="loginPassword">Contraseña</label>
            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-full btn-lg" id="loginBtn">
              <span class="btn-spinner"></span>
              <span class="btn-text">Ingresar al sistema</span>
            </button>
          </div>
          <div style="text-align:center;margin-top:16px;font-size:0.78rem;color:var(--color-gray-400);line-height:1.6;">
            <strong>Usuarios demo:</strong><br>
            admin@clinica.com / admin123<br>
            medico@clinica.com / medico123
          </div>
        </form>
      </div>
    `;
  }

  function bindLoginEvents() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const btn = document.getElementById('loginBtn');
      btn.classList.add('loading');
      btn.disabled = true;
      setTimeout(async () => {
        const user = await Auth.login(email, password);
        if (user) {
          enterApp();
        } else {
          btn.classList.remove('loading');
          btn.disabled = false;
          Components.showToast({ message: 'Credenciales incorrectas. Intente nuevamente.', type: 'error', duration: 3000 });
        }
      }, 600);
    });
  }

  /* === ENTER APP (fade out login) === */
  function enterApp() {
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.add('hidden');
    setTimeout(() => {
      loginScreen.style.display = 'none';
      buildApp();
    }, 500);
  }

  /* === BUILD APP SHELL === */
  function buildApp() {
    const user = Auth.getCurrentUser();
    const modulos = Auth.getModulos();
    const rolLabel = Auth.getRolLabel();
    const initials = Components.getInitials(user.nombre);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <button class="sidebar-close-btn" id="sidebarClose" aria-label="Cerrar menú">&times;</button>
            <img src="img/logo-clinica.png" alt="ClinicaSoft" class="sidebar-brand-img">
            <div class="sidebar-brand-text">
              <h2>ClinicaSoft</h2>
              <small>Gestión Clínica</small>
            </div>
          </div>
          <nav class="sidebar-nav" id="sidebarNav">
            <div class="sidebar-nav-title">Módulos</div>
            ${modulos.map(m => `
              <div class="nav-item${m === currentModule ? ' active' : ''}" data-module="${m}">
                <span class="nav-icon">${getModuleIcon(m)}</span>
                <span>${m}</span>
              </div>
            `).join('')}
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-user">
              <div class="sidebar-avatar">${initials}</div>
              <div class="sidebar-user-info">
                <div class="name">${user.nombre}</div>
                <div class="role">${rolLabel}</div>
              </div>
            </div>
            <button class="btn-logout" id="btnLogout">
              ${Components.icon('box-arrow-right')}
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <main class="main-content" id="mainContent">
          <div class="main-header">
            <button class="btn btn-icon sidebar-hamburger" id="sidebarToggle" aria-label="Abrir menú">${Components.icon('list')}</button>
            <div class="main-header-text">
              <h1 id="moduleTitle">${currentModule}</h1>
              <p id="moduleSubtitle"></p>
            </div>
          </div>
          <div class="module-content" id="moduleContent"></div>
        </main>
      </div>
    `;

    bindSidebarEvents();
    bindLogoutEvent();
    renderModule(currentModule);
  }

  function getModuleIcon(mod) {
    const icons = {
      'Dashboard': Components.icon('speedometer2'),
      'Pacientes': Components.icon('people'),
      'Citas Médicas': Components.icon('calendar-check'),
      'Historia Clínica': Components.icon('clipboard2-pulse'),
      'Finanzas': Components.icon('cash-coin'),
      'Administración': Components.icon('gear')
    };
    return icons[mod] || Components.icon('grid-3x3-gap');
  }

  function bindSidebarEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const mod = item.dataset.module;
        if (mod === currentModule) return;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        currentModule = mod;
        document.getElementById('moduleTitle').textContent = mod;
        renderModule(mod);
        closeSidebar();
      });
    });
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
  }
  function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('app')?.classList.toggle('sidebar-open');
  }
  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('app')?.classList.remove('sidebar-open');
  }

  function bindLogoutEvent() {
    document.getElementById('btnLogout').addEventListener('click', () => {
      Auth.logout();
      location.reload();
    });
  }

  /* === RENDER MODULE DISPATCHER === */
  function renderModule(mod) {
    const container = document.getElementById('moduleContent');
    container.innerHTML = '';
    container.className = 'module-content';
    const subtitle = document.getElementById('moduleSubtitle');
    switch (mod) {
      case 'Dashboard': renderDashboard(container); subtitle.textContent = 'Resumen operativo del día'; break;
      case 'Pacientes': renderPacientes(container); subtitle.textContent = 'Gestión de pacientes'; break;
      case 'Citas Médicas': renderCitas(container); subtitle.textContent = 'Programación y control de citas'; break;
      case 'Historia Clínica': renderHistoriaClinica(container); subtitle.textContent = 'Registro clínico electrónico'; break;
      case 'Finanzas': renderFinanzas(container); subtitle.textContent = 'Gestión de pagos e ingresos'; break;
      case 'Administración': renderAdministracion(container); subtitle.textContent = 'Configuración del sistema'; break;
    }
    // Re-trigger animation by re-setting class
    container.className = 'module-content';
    void container.offsetWidth;
    container.className = 'module-content';
  }

  /* ============================================================
     MÓDULO: DASHBOARD
     ============================================================ */
  function renderDashboard(container) {
    const finanzas = ClinicaData.finanzas;
    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Components.icon('people', 'icon-kpi')}</div>
          <div class="kpi-label">Pacientes Hoy</div>
          <div class="kpi-value">${finanzas.pacientesHoy}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber">${Components.icon('clock-history', 'icon-kpi')}</div>
          <div class="kpi-label">Citas Pendientes</div>
          <div class="kpi-value">${finanzas.citasPendientes}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">${Components.icon('check2-circle', 'icon-kpi')}</div>
          <div class="kpi-label">Atendidas Hoy</div>
          <div class="kpi-value">${finanzas.atendidasHoy}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple">${Components.icon('cash-stack', 'icon-kpi')}</div>
          <div class="kpi-label">Ingresos del Día</div>
          <div class="kpi-value">S/ ${finanzas.ingresosHoy.toLocaleString()}</div>
        </div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3>${Components.icon('graph-up-arrow')} Ingresos de la Semana</h3>
          </div>
          <div class="chart-container">
            <canvas id="weeklyChart"></canvas>
            <div class="chart-tooltip" id="chartTooltip"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3>${Components.icon('calendar-week')} Próximas Citas</h3>
          </div>
          <div id="upcomingAppointments"></div>
        </div>
      </div>
    `;

    renderUpcomingAppointments();
    renderWeeklyChart();
  }

  function renderUpcomingAppointments() {
    const container = document.getElementById('upcomingAppointments');
    const citas = ClinicaData.citas.filter(c => c.estado === 'Confirmada' || c.estado === 'Pendiente').slice(0, 5);
    container.innerHTML = citas.map(c => {
      const p = ClinicaData.pacientes.find(pac => pac.id === c.pacienteId);
      const badgeType = c.estado === 'Confirmada' ? 'primary' : 'warning';
      const pulseClass = c.estado === 'Pendiente' ? 'pulse' : '';
      return `
        <div class="appointment-item">
          ${p ? Components.createAvatar(p.nombre, p.apellido).outerHTML : '<div class="avatar-circle">??</div>'}
          <div class="appt-info">
            <div class="appt-patient">${p ? p.nombre + ' ' + p.apellido : 'Paciente'}</div>
            <div class="appt-detail">${c.especialidad} · Dr. ${ClinicaData.medicos.find(m => m.id === c.medicoId)?.nombre || ''}</div>
          </div>
          <div class="appt-time">${c.hora}</div>
          ${Components.createBadge(c.estado, badgeType, pulseClass).outerHTML}
        </div>
      `;
    }).join('');
  }

  function renderWeeklyChart() {
    Components.loadChartJS(() => {
      const ctx = document.getElementById('weeklyChart');
      if (!ctx) return;
      const data = ClinicaData.finanzas.ingresosDiarios;
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.dia),
          datasets: [{
            label: 'Ingresos (S/)',
            data: data.map(d => d.monto),
            backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#2563EB', '#3B82F6', '#60A5FA'],
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: '#1E293B',
              titleFont: { family: 'Inter', size: 12 },
              bodyFont: { family: 'Inter', size: 13 },
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                label: (ctx) => `S/ ${ctx.parsed.y.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { callback: (v) => 'S/ ' + v.toLocaleString(), font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          },
          onClick: (e) => {
            const bars = chartInstance.getElementsAtEventForMode(e, 'index', { intersect: true }, false);
            if (bars.length) {
              const idx = bars[0].index;
              const val = data[idx];
              Components.showToast({ message: `Ingresos del ${val.dia}: S/ ${val.monto.toLocaleString()}`, type: 'success' });
            }
          }
        }
      });
    });
  }

  /* ============================================================
     MÓDULO: PACIENTES
     ============================================================ */
  function renderPacientes(container) {
    container.innerHTML = `
      <div class="pill-tabs" id="pacientesTabs">
        <button class="pill-tab active" data-tab="lista">${Components.icon('list-ul')} Lista de Pacientes</button>
        <button class="pill-tab" data-tab="registrar">${Components.icon('person-plus')} Registrar Paciente</button>
        <button class="pill-tab" data-tab="historial">${Components.icon('folder2-open')} Historial Clínico</button>
        <button class="pill-tab" data-tab="estadisticas">${Components.icon('bar-chart-fill')} Estadísticas</button>
      </div>
      <div class="pill-tab-content active" id="pacientesLista"></div>
      <div class="pill-tab-content" id="pacientesRegistrar"></div>
      <div class="pill-tab-content" id="pacientesHistorial"></div>
      <div class="pill-tab-content" id="pacientesEstadisticas"></div>
    `;

    bindPillTabs('pacientesTabs', ['pacientesLista', 'pacientesRegistrar', 'pacientesHistorial', 'pacientesEstadisticas']);
    renderPacientesLista();
    renderPacientesRegistrar();
    renderPacientesHistorial();
    renderPacientesEstadisticas();
    document.querySelector('#pacientesTabs [data-tab="lista"]')?.addEventListener('click', () => { renderPacientesTableRows(); refreshPatientSelectors(); });
  }

  function renderPacientesLista() {
    const container = document.getElementById('pacientesLista');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="search-wrapper">
            <span class="search-icon">${Components.icon('search')}</span>
            <input type="text" class="form-control" id="buscarPaciente" placeholder="Buscar por nombre, DNI o seguro...">
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" id="btnNuevoPaciente">${Components.icon('person-plus')} Nuevo</button>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre Completo</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th>Seguro</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="pacientesTableBody"></tbody>
          </table>
        </div>
      </div>
    `;

    renderPacientesTableRows();
    document.getElementById('buscarPaciente')?.addEventListener('input', function () {
      filterPacientesTable(this.value);
    });
    document.getElementById('btnNuevoPaciente')?.addEventListener('click', () => {
      const tabs = document.querySelectorAll('#pacientesTabs .pill-tab');
      if (tabs[1]) tabs[1].click();
    });
  }

  function renderPacientesTableRows() {
    const tbody = document.getElementById('pacientesTableBody');
    tbody.innerHTML = ClinicaData.pacientes.map(p => `
      <tr data-search="${(p.dni + ' ' + p.nombre + ' ' + p.apellido + ' ' + p.seguro).toLowerCase()}">
        <td>${p.dni}</td>
        <td><strong>${p.nombre} ${p.apellido}</strong></td>
        <td>${p.edad}</td>
        <td>${p.telefono}</td>
        <td>${Components.createBadge(p.seguro, p.seguro === 'SIS' ? 'primary' : p.seguro === 'EsSalud' ? 'warning' : 'success').outerHTML}</td>
        <td>${Components.formatFecha(p.fechaRegistro)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="App.verPaciente(${p.id})">${Components.icon('eye')}</button>
          <button class="btn btn-outline btn-sm" onclick="App.editarPaciente(${p.id})">${Components.icon('pencil')}</button>
        </td>
      </tr>
    `).join('');
  }

  function filterPacientesTable(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('#pacientesTableBody tr').forEach(row => {
      const text = row.dataset.search || '';
      row.classList.toggle('filtered-out', q.length > 0 && !text.includes(q));
    });
  }

  function renderPacientesRegistrar() {
    const container = document.getElementById('pacientesRegistrar');
    container.innerHTML = `
      <div class="card">
        <div id="pSuccessBanner"></div>
        <h3 style="margin-bottom:20px;">${Components.icon('person-plus')} Registrar Nuevo Paciente</h3>
        <form id="formRegistrarPaciente" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label>DNI *</label>
              <input type="text" class="form-control" id="pDni" required maxlength="8" placeholder="12345678" inputmode="numeric">
              <div class="form-error" id="pDniError"></div>
            </div>
            <div class="form-group">
              <label>Nombres *</label>
              <input type="text" class="form-control" id="pNombres" required placeholder="Nombres completos">
              <div class="form-error" id="pNombresError"></div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Apellidos *</label>
              <input type="text" class="form-control" id="pApellidos" required placeholder="Apellidos completos">
              <div class="form-error" id="pApellidosError"></div>
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento *</label>
              <input type="date" class="form-control" id="pFechaNac" required>
              <div class="form-error" id="pFechaNacError"></div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Edad</label>
              <input type="number" class="form-control" id="pEdad" readonly min="0" max="120" placeholder="Se calcula automáticamente" style="background:var(--color-gray-100);color:var(--color-gray-500);">
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" class="form-control" id="pTelefono" placeholder="987654321" inputmode="numeric">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" id="pEmail" placeholder="paciente@email.com">
            </div>
            <div class="form-group">
              <label>Seguro</label>
              <select class="form-control" id="pSeguro">
                <option value="SIS">SIS</option>
                <option value="EsSalud">EsSalud</option>
                <option value="Particular">Particular</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" class="form-control" id="pDireccion" placeholder="Dirección completa">
          </div>
          <div style="margin-top:20px;">
            <button type="submit" class="btn btn-primary btn-lg" id="btnGuardarPaciente">
              <span class="btn-text">${Components.icon('floppy2')} Guardar Paciente</span>
            </button>
          </div>
        </form>
      </div>
    `;
    bindPacienteForm();
    bindPostmanIntegration();
  }

  function bindPacienteForm() {
    const form = document.getElementById('formRegistrarPaciente');
    if (!form) return;

    const dniInput = document.getElementById('pDni');
    const fechaNacInput = document.getElementById('pFechaNac');
    const edadInput = document.getElementById('pEdad');

    document.getElementById('pFechaNac').addEventListener('change', function () {
      if (this.value) {
        const edad = Validators.calcularEdad(this.value);
        document.getElementById('pEdad').value = edad !== null ? edad : '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const banner = document.getElementById('pSuccessBanner');
      banner.innerHTML = '';
      document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
      document.querySelectorAll('.form-error.visible').forEach(el => el.classList.remove('visible'));
      document.querySelectorAll('.dni-duplicate').forEach(el => el.classList.remove('dni-duplicate'));

      const data = {
        dni: dniInput.value.trim(),
        nombre: document.getElementById('pNombres').value.trim(),
        apellido: document.getElementById('pApellidos').value.trim(),
        fechaNacimiento: fechaNacInput.value,
        edad: edadInput.value,
        telefono: document.getElementById('pTelefono').value.trim(),
        email: document.getElementById('pEmail').value.trim(),
        direccion: document.getElementById('pDireccion').value.trim(),
        seguro: document.getElementById('pSeguro').value
      };

      const validacion = Validators.validarPaciente(data);
      if (!validacion.valid) {
        validacion.errores.forEach(err => Components.showToast({ message: err, type: 'warning' }));
        if (data.dni && !/^\d{8}$/.test(data.dni)) {
          dniInput.classList.add('error');
          document.getElementById('pDniError').textContent = Validators.validarDNI(data.dni).error;
          document.getElementById('pDniError').classList.add('visible');
        }
        return;
      }

      const btn = document.getElementById('btnGuardarPaciente');
      btn.classList.add('btn-loading');
      btn.disabled = true;

      try {
        const result = await PacienteService.registrar(data);

        if (result.status === 409) {
          btn.classList.remove('btn-loading');
          btn.disabled = false;
          dniInput.classList.add('error', 'dni-duplicate');
          document.getElementById('pDniError').textContent = result.error;
          document.getElementById('pDniError').classList.add('visible');
          Components.showToast({ message: result.error, type: 'error', duration: 5000 });
          return;
        }

        if (!result.success) {
          btn.classList.remove('btn-loading');
          btn.disabled = false;
          Components.showToast({ message: 'Error al registrar: ' + (result.error || 'desconocido'), type: 'error' });
          return;
        }

        btn.classList.remove('btn-loading');
        btn.disabled = false;

        renderPacientesTableRows();
        refreshPatientSelectors();

        const p = result.paciente;
        banner.innerHTML = `
          <div class="success-banner">
            <i class="bi bi-check-circle-fill"></i>
            <div class="success-banner-text">
              <strong>Expediente único creado exitosamente</strong>
              <span>Paciente: ${p.nombre} ${p.apellido} · DNI: ${p.dni} · ID: #${p.id} · ${p.fechaRegistro}</span>
            </div>
          </div>
        `;
        Components.showToast({ message: `✅ Expediente #${p.id}: ${p.nombre} ${p.apellido} registrado correctamente.`, type: 'success', duration: 5000 });
        form.reset();
        edadInput.value = '';
        setTimeout(() => { banner.innerHTML = ''; }, 8000);
      } catch (err) {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        Components.showToast({ message: 'Error inesperado: ' + err.message, type: 'error' });
      }
    });
  }

  function renderPacientesHistorial() {
    const container = document.getElementById('pacientesHistorial');
    container.innerHTML = `
      <div class="card">
          <div class="card-header"><h3>${Components.icon('folder2-open')} Historial Clínico por Paciente</h3></div>
        <div class="form-group">
          <label>Seleccionar Paciente</label>
          <select class="form-control" id="historialPacienteSelect">
            <option value="">-- Seleccione --</option>
            ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} (${p.dni})</option>`).join('')}
          </select>
        </div>
        <div id="historialPacienteDetalle"></div>
      </div>
    `;
    document.getElementById('historialPacienteSelect')?.addEventListener('change', function () {
      const id = parseInt(this.value);
      const det = document.getElementById('historialPacienteDetalle');
      if (!id) { det.innerHTML = ''; return; }
      const hc = ClinicaData.historiasClinicas.find(h => h.pacienteId === id);
      if (!hc) { det.innerHTML = '<p style="color:var(--color-gray-500);margin-top:12px;">Sin historial clínico registrado.</p>'; return; }
      det.innerHTML = `
        <div style="margin-top:16px;padding:16px;background:var(--color-gray-50);border-radius:var(--radius-md);">
          <p><strong>Fecha:</strong> ${Components.formatFecha(hc.fecha)}</p>
          <p><strong>Médico:</strong> ${hc.medico}</p>
          <p><strong>Especialidad:</strong> ${hc.especialidad.nombre}</p>
          <p><strong>CIE-10:</strong> ${hc.cie10.codigo} - ${hc.cie10.descripcion}</p>
          <p style="margin-top:8px;"><strong>Motivo:</strong> ${hc.motivo}</p>
          <p><strong>Examen Físico:</strong> ${hc.examenFisico}</p>
          <p><strong>Tratamiento:</strong> ${hc.tratamiento}</p>
        </div>
      `;
    });
  }

  function renderPacientesEstadisticas() {
    const container = document.getElementById('pacientesEstadisticas');
    container.innerHTML = `
      <div class="card">
          <div class="card-header"><h3>${Components.icon('bar-chart-fill')} Estadísticas de Pacientes</h3></div>
        <div class="grid-3">
          <div class="kpi-card"><div class="kpi-label">Total Pacientes</div><div class="kpi-value">${ClinicaData.pacientes.length}</div></div>
          <div class="kpi-card"><div class="kpi-label">Edad Promedio</div><div class="kpi-value">${Math.round(ClinicaData.pacientes.reduce((a, p) => a + p.edad, 0) / ClinicaData.pacientes.length)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Con SIS</div><div class="kpi-value">${ClinicaData.pacientes.filter(p => p.seguro === 'SIS').length}</div></div>
          <div class="kpi-card"><div class="kpi-label">EsSalud</div><div class="kpi-value">${ClinicaData.pacientes.filter(p => p.seguro === 'EsSalud').length}</div></div>
          <div class="kpi-card"><div class="kpi-label">Particular</div><div class="kpi-value">${ClinicaData.pacientes.filter(p => p.seguro === 'Particular').length}</div></div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     MÓDULO: CITAS MÉDICAS
     ============================================================ */
  function renderCitas(container) {
    container.innerHTML = `
      <div class="pill-tabs" id="citasTabs">
        <button class="pill-tab active" data-tab="lista">${Components.icon('list-ul')} Lista de Citas</button>
        <button class="pill-tab" data-tab="programar">${Components.icon('calendar-plus')} Programar Cita</button>
        <button class="pill-tab" data-tab="agenda">${Components.icon('calendar-week')} Agenda Médica</button>
      </div>
      <div class="pill-tab-content active" id="citasLista"></div>
      <div class="pill-tab-content" id="citasProgramar"></div>
      <div class="pill-tab-content" id="citasAgenda"></div>
    `;
    bindPillTabs('citasTabs', ['citasLista', 'citasProgramar', 'citasAgenda']);
    renderCitasLista();
    renderCitasProgramar();
    renderCitasAgenda();
    document.querySelector('#citasTabs [data-tab="lista"]')?.addEventListener('click', () => renderCitasLista());
    document.querySelector('#citasTabs [data-tab="agenda"]')?.addEventListener('click', () => renderCitasAgenda());
  }

  function renderCitasLista() {
    const container = document.getElementById('citasLista');
    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Médico</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${ClinicaData.citas.map(c => {
                const p = ClinicaData.pacientes.find(pac => pac.id === c.pacienteId);
                const m = ClinicaData.medicos.find(med => med.id === c.medicoId);
                const badgeType = c.estado === 'Confirmada' ? 'primary' : c.estado === 'Pendiente' ? 'warning' : c.estado === 'Atendida' ? 'success' : 'danger';
                const pulseClass = c.estado === 'Pendiente' ? 'pulse' : '';
                return `<tr>
                  <td>${p ? p.nombre + ' ' + p.apellido : '-'}</td>
                  <td>${c.especialidad}</td>
                  <td>${m ? m.nombre : '-'}</td>
                  <td>${Components.formatFecha(c.fecha)}</td>
                  <td>${c.hora}</td>
                  <td>${Components.createBadge(c.estado, badgeType, pulseClass).outerHTML}</td>
                  <td><button class="btn btn-outline btn-sm" onclick="App.verCita(${c.id})">${Components.icon('eye')}</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCitasProgramar() {
    const container = document.getElementById('citasProgramar');
    container.innerHTML = `
      <div class="card">
        <h3 style="margin-bottom:20px;">Programar Nueva Cita</h3>
        <form id="formCita">
          <div class="form-row">
            <div class="form-group">
              <label>Paciente *</label>
              <select class="form-control" id="citaPaciente" required>
                <option value="">-- Seleccione --</option>
                ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Especialidad *</label>
              <select class="form-control" id="citaEspecialidad" required>
                <option value="">-- Seleccione --</option>
                ${ClinicaData.especialidades.filter(e => e.activo).map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Médico *</label>
              <select class="form-control" id="citaMedico" required>
                <option value="">-- Seleccione --</option>
                ${ClinicaData.medicos.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Fecha *</label>
              <input type="date" class="form-control" id="citaFecha" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Hora *</label>
              <input type="time" class="form-control" id="citaHora" required>
            </div>
            <div class="form-group">
              <label>Motivo</label>
              <input type="text" class="form-control" id="citaMotivo" placeholder="Motivo de la consulta">
            </div>
          </div>
          <div style="margin-top:20px;">
            <button type="submit" class="btn btn-primary">${Components.icon('calendar-check')} Programar Cita</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('formCita')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pacienteId = parseInt(document.getElementById('citaPaciente').value);
      const especialidad = document.getElementById('citaEspecialidad').value;
      const medicoId = parseInt(document.getElementById('citaMedico').value);
      const fecha = document.getElementById('citaFecha').value;
      const hora = document.getElementById('citaHora').value;
      const motivo = document.getElementById('citaMotivo').value.trim();
      if (!pacienteId || !especialidad || !medicoId || !fecha || !hora) {
        Components.showToast({ message: 'Complete todos los campos obligatorios.', type: 'warning' });
        return;
      }
      const nuevaCita = { id: ClinicaData.nextId('citas'), pacienteId, medicoId, especialidad, fecha, hora, estado: 'Pendiente', motivo };
      ClinicaData.citas.push(nuevaCita);
      Components.showToast({ message: 'Cita programada correctamente.', type: 'success' });
      e.target.reset();
      // Refrescar agenda si está visible
      if (document.getElementById('citasAgenda')?.classList.contains('active')) {
        renderCitasAgenda();
      }
    });
    refreshPatientSelectors();
  }

  /* === Postman mock integration: envía datos del formulario al endpoint simulado === */
  function bindPostmanIntegration() {
    const formulario = document.getElementById('formRegistrarPaciente');
    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
      const datosPaciente = {
        nombres: document.getElementById('pNombres')?.value || '',
        apellidos: document.getElementById('pApellidos')?.value || '',
        dni: document.getElementById('pDni')?.value || '',
        telefono: document.getElementById('pTelefono')?.value || '',
        correo: document.getElementById('pEmail')?.value || '',
        fecha_nacimiento: document.getElementById('pFechaNac')?.value || '',
        seguro: document.getElementById('pSeguro')?.value || '',
        direccion: document.getElementById('pDireccion')?.value || ''
      };
      PacienteService.registrarEnPostman(datosPaciente);
    });
  }

  function renderCitasAgenda() {
    const container = document.getElementById('citasAgenda');
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    let html = `<div class="card"><div class="agenda-wrapper"><div class="agenda-grid">`;
    html += `<div class="agenda-header">Hora</div>`;
    dias.forEach(d => { html += `<div class="agenda-header">${d}</div>`; });
    const diaIndex = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5 };
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    horas.forEach(h => {
      html += `<div class="agenda-time">${h}</div>`;
      for (let i = 0; i < 5; i++) {
        const cellDate = new Date(monday);
        cellDate.setDate(monday.getDate() + i);
        const dateStr = cellDate.toISOString().split('T')[0];
        const citaEnCelda = ClinicaData.citas.find(c => c.fecha === dateStr && c.hora === h && (c.estado === 'Pendiente' || c.estado === 'Confirmada'));
        if (citaEnCelda) {
          const p = ClinicaData.pacientes.find(pac => pac.id === citaEnCelda.pacienteId);
          html += `<div class="agenda-cell occupied" title="${p ? p.nombre+' '+p.apellido : ''} - ${citaEnCelda.motivo}"><span class="appt-dot"></span> ${p ? p.nombre.split(' ')[0] : 'Ocupado'}</div>`;
        } else {
          html += `<div class="agenda-cell free">Libre</div>`;
        }
      }
    });
    html += `</div></div></div>`;
    container.innerHTML = html;
  }

  /* ============================================================
     MÓDULO: HISTORIA CLÍNICA
     ============================================================ */
  function renderHistoriaClinica(container) {
    container.innerHTML = `
      <div class="pill-tabs" id="historiaTabs">
        <button class="pill-tab active" data-tab="atencion">${Components.icon('heart-pulse-fill')} Atención</button>
        <button class="pill-tab" data-tab="receta">${Components.icon('journal-text')} Receta</button>
        <button class="pill-tab" data-tab="archivos">${Components.icon('paperclip')} Archivos</button>
      </div>
      <div class="pill-tab-content active" id="historiaAtencion"></div>
      <div class="pill-tab-content" id="historiaReceta"></div>
      <div class="pill-tab-content" id="historiaArchivos"></div>
    `;
    bindPillTabs('historiaTabs', ['historiaAtencion', 'historiaReceta', 'historiaArchivos']);
    renderHistoriaAtencion();
    renderHistoriaReceta();
    renderHistoriaArchivos();
    document.querySelector('#historiaTabs [data-tab="atencion"]')?.addEventListener('click', () => refreshPatientSelectors());
    document.querySelector('#historiaTabs [data-tab="receta"]')?.addEventListener('click', () => refreshPatientSelectors());
  }

  let currentHCId = null;

  function renderHistoriaAtencion() {
    const container = document.getElementById('historiaAtencion');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${Components.icon('heart-pulse-fill')} Atención al Paciente</h3>
          <button class="btn btn-primary btn-sm" id="btnHcNuevoPaciente">${Components.icon('person-plus')} Nuevo Paciente</button>
        </div>
        <div class="form-group">
          <label>Paciente</label>
          <select class="form-control" id="hcPacienteSelect">
            <option value="">-- Seleccione paciente --</option>
            ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} (${p.dni})</option>`).join('')}
          </select>
        </div>
        <div id="hcInfoBadge" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;min-height:28px;">
          <span style="font-size:0.85rem;color:var(--color-gray-400);">Seleccione un paciente para ver su información</span>
        </div>
        <div class="form-group">
          <label>Motivo de Consulta</label>
          <textarea class="form-control" id="hcMotivo" rows="3" placeholder="Describa el motivo de la consulta..."></textarea>
        </div>
        <div class="form-group">
          <label>Examen Físico</label>
          <textarea class="form-control" id="hcExamen" rows="3" placeholder="Hallazgos del examen físico..."></textarea>
        </div>
        <div class="form-group">
          <label>Diagnóstico CIE-10</label>
          <div class="autocomplete-wrapper">
            <input type="text" class="form-control" id="hcCie10" placeholder="Buscar código o descripción... (ej: I10, J06)" autocomplete="off">
            <div class="autocomplete-menu" id="cie10Menu"></div>
          </div>
          <div id="cie10Selected"></div>
        </div>
        <div class="form-group">
          <label>Tratamiento</label>
          <textarea class="form-control" id="hcTratamiento" rows="2" placeholder="Indicaciones y tratamiento..."></textarea>
        </div>
        <div style="margin-top:16px;">
          <button class="btn btn-primary" id="btnGuardarHistoria">${Components.icon('floppy2')} Guardar Historia Clínica</button>
        </div>
      </div>
    `;
    bindCIE10Autocomplete();
    document.getElementById('hcPacienteSelect').addEventListener('change', function () {
      hcCargarPaciente(parseInt(this.value));
    });
    document.getElementById('btnGuardarHistoria').addEventListener('click', hcGuardarHistoria);
    document.getElementById('btnHcNuevoPaciente').addEventListener('click', hcRegistrarPacienteRapido);
  }

  function hcRegistrarPacienteRapido(onSuccess) {
    Components.showModal({
      title: 'Registrar Nuevo Paciente',
      confirmText: 'Guardar Paciente',
      content: `
        <div class="form-group">
          <label>DNI *</label>
          <input type="text" class="form-control" id="hcQuickDni" maxlength="8" placeholder="12345678">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nombres *</label>
            <input type="text" class="form-control" id="hcQuickNombres" placeholder="Nombres">
          </div>
          <div class="form-group">
            <label>Apellidos *</label>
            <input type="text" class="form-control" id="hcQuickApellidos" placeholder="Apellidos">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha de Nacimiento *</label>
            <input type="date" class="form-control" id="hcQuickFechaNac">
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" class="form-control" id="hcQuickTelefono" placeholder="987654321">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" id="hcQuickEmail" placeholder="paciente@email.com">
          </div>
          <div class="form-group">
            <label>Seguro</label>
            <select class="form-control" id="hcQuickSeguro">
              <option value="SIS">SIS</option>
              <option value="EsSalud">EsSalud</option>
              <option value="Particular">Particular</option>
            </select>
          </div>
        </div>
        <div id="hcQuickError" style="color:var(--color-danger);font-size:0.85rem;margin-top:8px;"></div>
      `,
      onConfirm: async () => {
        const errorDiv = document.getElementById('hcQuickError');
        errorDiv.textContent = '';
        const data = {
          dni: document.getElementById('hcQuickDni').value.trim(),
          nombre: document.getElementById('hcQuickNombres').value.trim(),
          apellido: document.getElementById('hcQuickApellidos').value.trim(),
          fechaNacimiento: document.getElementById('hcQuickFechaNac').value,
          edad: '',
          telefono: document.getElementById('hcQuickTelefono').value.trim(),
          email: document.getElementById('hcQuickEmail').value.trim(),
          seguro: document.getElementById('hcQuickSeguro').value,
          direccion: ''
        };
        const v = Validators.validarPaciente(data);
        if (!v.valid) { errorDiv.textContent = v.errores.join(' '); return false; }
        const confirmBtn = document.querySelector('.btn-modal-confirm');
        confirmBtn.classList.add('btn-loading');
        confirmBtn.disabled = true;
        const result = await PacienteService.registrar(data);
        confirmBtn.classList.remove('btn-loading');
        confirmBtn.disabled = false;
        if (result.status === 409) {
          errorDiv.textContent = result.error;
          document.getElementById('hcQuickDni').classList.add('error');
          return false;
        }
        if (!result.success) {
          errorDiv.textContent = result.error || 'Error al registrar.';
          return false;
        }
        refreshPatientSelectors();
        if (onSuccess) onSuccess(result.paciente);
        const select = document.getElementById('hcPacienteSelect');
        if (select && result.paciente) select.value = result.paciente.id;
        if (select && result.paciente) hcCargarPaciente(result.paciente.id);
        const banner = document.getElementById('historiaAtencion').querySelector('.card-header');
        const temp = document.createElement('div');
        temp.className = 'success-banner';
        temp.style.marginBottom = '16px';
        temp.innerHTML = `<i class="bi bi-check-circle-fill"></i><div class="success-banner-text"><strong>Expediente #${result.paciente.id} creado</strong><span>${result.paciente.nombre} ${result.paciente.apellido} · DNI: ${result.paciente.dni}</span></div>`;
        banner.parentNode.insertBefore(temp, banner.nextSibling);
        setTimeout(() => temp.remove(), 6000);
        Components.showToast({ message: `✅ Expediente #${result.paciente.id}: ${result.paciente.nombre} ${result.paciente.apellido} registrado.`, type: 'success', duration: 5000 });
      }
    });
  }

  function hcCargarPaciente(id) {
    const badge = document.getElementById('hcInfoBadge');
    if (!id) {
      badge.innerHTML = '<span style="font-size:0.85rem;color:var(--color-gray-400);">Seleccione un paciente para ver su información</span>';
      document.getElementById('hcMotivo').value = '';
      document.getElementById('hcExamen').value = '';
      document.getElementById('hcTratamiento').value = '';
      document.getElementById('cie10Selected').innerHTML = '';
      currentHCId = null;
      return;
    }
    const p = ClinicaData.pacientes.find(pac => pac.id === id);
    const hc = ClinicaData.historiasClinicas.find(h => h.pacienteId === id);
    currentHCId = id;
    if (hc) {
      badge.innerHTML = `
        ${Components.createBadge(hc.especialidad.nombre, 'primary').outerHTML}
        <span style="font-size:0.85rem;color:var(--color-gray-500);">${hc.medico} · ${Components.formatFecha(hc.fecha)}</span>
      `;
      document.getElementById('hcMotivo').value = hc.motivo;
      document.getElementById('hcExamen').value = hc.examenFisico;
      document.getElementById('hcTratamiento').value = hc.tratamiento || '';
      document.getElementById('cie10Selected').innerHTML = '';
      if (hc.cie10) selectCIE10(hc.cie10);
    } else {
      const user = Auth.getCurrentUser();
      const today = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
      badge.innerHTML = `
        ${p ? `<span style="font-size:0.85rem;color:var(--color-gray-500);">Nueva historia para ${p.nombre} ${p.apellido} · ${today}</span>` : ''}
      `;
      document.getElementById('hcMotivo').value = '';
      document.getElementById('hcExamen').value = '';
      document.getElementById('hcTratamiento').value = '';
      document.getElementById('cie10Selected').innerHTML = '';
    }
  }

  function hcGuardarHistoria() {
    const pacienteId = parseInt(document.getElementById('hcPacienteSelect').value);
    if (!pacienteId) { Components.showToast({ message: 'Seleccione un paciente.', type: 'warning' }); return; }
    const motivo = document.getElementById('hcMotivo').value.trim();
    const examenFisico = document.getElementById('hcExamen').value.trim();
    const tratamiento = document.getElementById('hcTratamiento').value.trim();
    const cieContainer = document.getElementById('cie10Selected');
    const codigoEl = cieContainer.querySelector('code');
    const descEl = cieContainer.querySelector('span:not(.remove-cie)');
    if (!motivo || !examenFisico || !codigoEl) {
      Components.showToast({ message: 'Complete el motivo, examen físico y diagnóstico CIE-10.', type: 'warning' });
      return;
    }
    const cie10 = { codigo: codigoEl.textContent, descripcion: descEl ? descEl.textContent : '' };
    const user = Auth.getCurrentUser();
    const userNombre = user ? user.nombre : 'Dr. Desconocido';
    let hc = ClinicaData.historiasClinicas.find(h => h.pacienteId === pacienteId);
    if (hc) {
      hc.motivo = motivo;
      hc.examenFisico = examenFisico;
      hc.tratamiento = tratamiento;
      hc.cie10 = cie10;
      hc.fecha = new Date().toISOString().split('T')[0];
    } else {
      hc = {
        pacienteId,
        especialidad: { id: 1, nombre: 'Medicina General' },
        medico: userNombre,
        fecha: new Date().toISOString().split('T')[0],
        motivo,
        examenFisico,
        cie10,
        tratamiento,
        examenes: [],
        receta: [],
        archivos: []
      };
      ClinicaData.historiasClinicas.push(hc);
    }
    const p = ClinicaData.pacientes.find(pac => pac.id === pacienteId);
    const badge = document.getElementById('hcInfoBadge');
    badge.innerHTML = `
      ${Components.createBadge(hc.especialidad.nombre, 'primary').outerHTML}
      <span style="font-size:0.85rem;color:var(--color-gray-500);">${hc.medico} · ${Components.formatFecha(hc.fecha)}</span>
    `;
    Components.showToast({ message: `Historia clínica de ${p ? p.nombre + ' ' + p.apellido : ''} guardada correctamente.`, type: 'success' });
  }

  function bindCIE10Autocomplete() {
    const input = document.getElementById('hcCie10');
    const menu = document.getElementById('cie10Menu');
    if (!input || !menu) return;
    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      if (q.length < 1) { menu.classList.remove('open'); return; }
      const results = ClinicaData.codigosCIE10.filter(c =>
        c.codigo.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q)
      ).slice(0, 6);
      if (results.length === 0) { menu.classList.remove('open'); return; }
      menu.innerHTML = results.map(r => `
        <div class="autocomplete-item" data-codigo="${r.codigo}" data-desc="${r.descripcion}">
          <code>${r.codigo}</code>
          <span>${r.descripcion}</span>
        </div>
      `).join('');
      menu.classList.add('open');
      menu.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          selectCIE10({ codigo: el.dataset.codigo, descripcion: el.dataset.desc });
          input.value = '';
          menu.classList.remove('open');
        });
      });
    });
    input.addEventListener('blur', () => { setTimeout(() => menu.classList.remove('open'), 200); });
    input.addEventListener('focus', function () {
      if (this.value.trim().length >= 1) {
        const evt = new Event('input');
        this.dispatchEvent(evt);
      }
    });
  }

  function selectCIE10(cie) {
    const container = document.getElementById('cie10Selected');
    if (!container) return;
    container.innerHTML = `
      <div class="cie10-badge">
        <code style="font-weight:700;">${cie.codigo}</code>
        <span>${cie.descripcion}</span>
        <span class="remove-cie">&times;</span>
      </div>
    `;
    container.querySelector('.remove-cie')?.addEventListener('click', () => { container.innerHTML = ''; });
  }

  function renderHistoriaReceta() {
    const container = document.getElementById('historiaReceta');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${Components.icon('journal-text')} Receta Médica</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" id="btnRecetaNuevoPaciente">${Components.icon('person-plus')} Nuevo</button>
            <button class="btn btn-primary btn-sm" id="btnAgregarFila">${Components.icon('plus-lg')} Agregar fila</button>
          </div>
        </div>
        <div class="form-group">
          <label>Paciente</label>
          <select class="form-control" id="recetaPacienteSelect">
            <option value="">-- Seleccione paciente --</option>
            ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} (${p.dni})</option>`).join('')}
          </select>
        </div>
        <div class="receta-rows" id="recetaRows"></div>
        <div style="margin-top:16px;">
          <button class="btn btn-primary" id="btnGuardarReceta">${Components.icon('floppy2')} Guardar Receta</button>
        </div>
      </div>
    `;
    addRecetaRow();
    document.getElementById('btnAgregarFila')?.addEventListener('click', addRecetaRow);
    document.getElementById('btnGuardarReceta')?.addEventListener('click', guardarReceta);
    document.getElementById('btnRecetaNuevoPaciente')?.addEventListener('click', () => {
      hcRegistrarPacienteRapido((nuevoPaciente) => {
        const select = document.getElementById('recetaPacienteSelect');
        if (select && nuevoPaciente) select.value = nuevoPaciente.id;
      });
    });
  }

  function guardarReceta() {
    const pacienteId = parseInt(document.getElementById('recetaPacienteSelect').value);
    if (!pacienteId) { Components.showToast({ message: 'Seleccione un paciente.', type: 'warning' }); return; }
    const rows = document.querySelectorAll('#recetaRows .receta-row');
    const medicamentos = [];
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      if (inputs.length >= 4) {
        const med = inputs[0].value.trim();
        const dosis = inputs[1].value.trim();
        const frecuencia = inputs[2].value.trim();
        const duracion = inputs[3].value.trim();
        if (med) medicamentos.push({ medicamento: med, dosis, frecuencia, duracion });
      }
    });
    if (medicamentos.length === 0) { Components.showToast({ message: 'Agregue al menos un medicamento.', type: 'warning' }); return; }
    let hc = ClinicaData.historiasClinicas.find(h => h.pacienteId === pacienteId);
    if (hc) {
      hc.receta = medicamentos;
    } else {
      const user = Auth.getCurrentUser();
      hc = {
        pacienteId,
        especialidad: { id: 1, nombre: 'Medicina General' },
        medico: user ? user.nombre : 'Dr. Desconocido',
        fecha: new Date().toISOString().split('T')[0],
        motivo: '',
        examenFisico: '',
        cie10: { codigo: '', descripcion: '' },
        tratamiento: '',
        examenes: [],
        receta: medicamentos,
        archivos: []
      };
      ClinicaData.historiasClinicas.push(hc);
    }
    const p = ClinicaData.pacientes.find(pac => pac.id === pacienteId);
    Components.showToast({ message: `Receta guardada para ${p ? p.nombre + ' ' + p.apellido : ''} (${medicamentos.length} medicamento(s)).`, type: 'success' });
  }

  function addRecetaRow() {
    const rows = document.getElementById('recetaRows');
    if (!rows) return;
    const row = document.createElement('div');
    row.className = 'receta-row';
    row.innerHTML = `
      <div class="form-group">
        <label>Medicamento</label>
        <input type="text" class="form-control" placeholder="Nombre del medicamento">
      </div>
      <div class="form-group">
        <label>Dosis</label>
        <input type="text" class="form-control" placeholder="Ej: 1 tableta">
      </div>
      <div class="form-group">
        <label>Frecuencia</label>
        <input type="text" class="form-control" placeholder="Ej: Cada 12 horas">
      </div>
      <div class="form-group">
        <label>Duración</label>
        <input type="text" class="form-control" placeholder="Ej: 7 días">
      </div>
      <button class="btn btn-danger btn-sm btn-icon" style="align-self:end;margin-bottom:2px;" title="Eliminar">&times;</button>
    `;
    row.querySelector('.btn-danger')?.addEventListener('click', () => {
      row.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      setTimeout(() => row.remove(), 200);
    });
    rows.appendChild(row);
  }

  const archivosSubidos = []; // track uploaded files per session

  function renderHistoriaArchivos() {
    const container = document.getElementById('historiaArchivos');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${Components.icon('paperclip')} Archivos Clínicos</h3>
          <span style="font-size:0.82rem;color:var(--color-gray-500);" id="archivosCount">0 archivos</span>
        </div>
        <div class="form-group">
          <label>Paciente</label>
          <select class="form-control" id="archivoPacienteSelect">
            <option value="">-- Seleccione paciente (opcional) --</option>
            ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} (${p.dni})</option>`).join('')}
          </select>
        </div>
        <div class="drop-zone" id="dropZone">
          <div class="drop-zone-icon">${Components.icon('cloud-upload', 'bi-icon-2xl')}</div>
          <div class="drop-zone-text">Arrastre y suelte archivos aquí</div>
          <div class="drop-zone-hint">PDF, JPG, PNG, DICOM — Máx 10MB por archivo</div>
        </div>
        <div id="archivosLista" style="margin-top:16px;"></div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline btn-sm" id="btnLimpiarArchivos">${Components.icon('trash')} Limpiar todo</button>
          <button class="btn btn-primary btn-sm" id="btnSubirArchivos">${Components.icon('upload')} Subir archivos a Supabase</button>
        </div>
      </div>
    `;

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.dcm,.dicom';
    fileInput.style.display = 'none';
    fileInput.id = 'fileInput';
    dropZone.parentNode.insertBefore(fileInput, dropZone.nextSibling);

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function getFileIcon(name) {
      const ext = name.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'filetype-pdf';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'file-image';
      if (['dcm', 'dicom'].includes(ext)) return 'file-earmark-medical';
      if (['doc', 'docx'].includes(ext)) return 'filetype-docx';
      if (['xls', 'xlsx'].includes(ext)) return 'filetype-xlsx';
      return 'file-earmark';
    }

    function addFiles(fileList) {
      let added = 0;
      for (const file of fileList) {
        if (file.size > 10 * 1024 * 1024) {
          Components.showToast({ message: `"${file.name}" excede 10MB. Se omitió.`, type: 'warning' });
          continue;
        }
        if (archivosSubidos.some(f => f.name === file.name && f.size === file.size)) {
          Components.showToast({ message: `"${file.name}" ya fue agregado.`, type: 'warning' });
          continue;
        }
        const reader = new FileReader();
        const fileData = { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, dataUrl: null, file: file };
        const idx = archivosSubidos.length;
        archivosSubidos.push(fileData);
        added++;
        reader.onload = (ev) => {
          fileData.dataUrl = ev.target.result;
          const badge = document.querySelector(`.archivo-item[data-idx="${idx}"] .archivo-status`);
          if (badge) { badge.textContent = 'Listo'; badge.className = 'badge badge-success'; }
        };
        reader.onerror = () => {
          const badge = document.querySelector(`.archivo-item[data-idx="${idx}"] .archivo-status`);
          if (badge) { badge.textContent = 'Error'; badge.className = 'badge badge-danger'; }
        };
        reader.readAsDataURL(file);
      }
      if (added > 0) {
        renderArchivosLista();
        Components.showToast({ message: `${added} archivo(s) agregado(s) correctamente.`, type: 'success' });
      }
    }

    function renderArchivosLista() {
      const lista = document.getElementById('archivosLista');
      const count = document.getElementById('archivosCount');
      if (!lista) return;
      if (archivosSubidos.length === 0) {
        lista.innerHTML = `<p style="color:var(--color-gray-400);text-align:center;padding:20px 0;font-size:0.88rem;">${Components.icon('inbox')} No hay archivos agregados aún</p>`;
        if (count) count.textContent = '0 archivos';
        return;
      }
      if (count) count.textContent = `${archivosSubidos.length} archivo(s)`;
      lista.innerHTML = archivosSubidos.map((f, i) => `
        <div class="archivo-item" data-idx="${i}">
          <div class="archivo-icon">${Components.icon(getFileIcon(f.name))}</div>
          <div class="archivo-info">
            <div class="archivo-name">${f.name}</div>
            <div class="archivo-meta">${formatFileSize(f.size)} · ${f.type || 'desconocido'}</div>
          </div>
          <span class="archivo-status badge badge-warning">Cargando...</span>
          <button class="btn btn-danger btn-sm btn-icon archivo-remove" data-idx="${i}" title="Eliminar">${Components.icon('x-lg')}</button>
        </div>
      `).join('');
      lista.querySelectorAll('.archivo-remove').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.dataset.idx);
          archivosSubidos.splice(idx, 1);
          renderArchivosLista();
        });
      });
    }

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    });

    // Click to open file picker
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        addFiles(fileInput.files);
        fileInput.value = '';
      }
    });

    // Botones de acción
    document.getElementById('btnLimpiarArchivos')?.addEventListener('click', () => {
      if (archivosSubidos.length === 0) return;
      archivosSubidos.length = 0;
      renderArchivosLista();
      Components.showToast({ message: 'Todos los archivos fueron eliminados.', type: 'info' });
    });
    document.getElementById('btnSubirArchivos')?.addEventListener('click', async () => {
      if (archivosSubidos.length === 0) {
        Components.showToast({ message: 'No hay archivos para subir.', type: 'warning' });
        return;
      }

      const btn = document.getElementById('btnSubirArchivos');
      btn.disabled = true;
      btn.innerHTML = `${Components.icon('arrow-repeat')} Subiendo...`;

      let uploaded = 0;
      let failed = 0;

      for (let i = 0; i < archivosSubidos.length; i++) {
        const fileData = archivosSubidos[i];
        const itemEl = document.querySelector(`.archivo-item[data-idx="${i}"]`);
        const badge = itemEl?.querySelector('.archivo-status');

        if (badge) { badge.textContent = 'Subiendo...'; badge.className = 'badge badge-warning'; }

        try {
          if (SupabaseService.isAvailable()) {
            const sb = SupabaseService.getClient();
            const file = fileData.file || base64ToFile(fileData.dataUrl, fileData.name, fileData.type);

            const bucketName = 'archivos-clinicos';
            const filePath = `${Date.now()}_${fileData.name}`;

            const { data: uploadData, error: uploadError } = await sb.storage
              .from(bucketName)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: fileData.type
              });

            if (uploadError) {
              if (uploadError.message?.includes('bucket')) {
                failed++;
                if (badge) { badge.textContent = 'Bucket no existe'; badge.className = 'badge badge-danger'; }
                Components.showToast({ message: `"${fileData.name}": Crea el bucket "${bucketName}" en Supabase Storage`, type: 'error', duration: 5000 });
                continue;
              }
              throw uploadError;
            }

            const { data: { publicUrl } } = sb.storage.from(bucketName).getPublicUrl(filePath);

            const pacienteId = parseInt(document.getElementById('archivoPacienteSelect')?.value);
            const { error: dbError } = await SupabaseService.insert('archivos_clinicos', {
              paciente_id: isNaN(pacienteId) ? null : pacienteId,
              nombre: fileData.name,
              tipo: fileData.type,
              tamano: fileData.size,
              url: publicUrl
            });

            if (dbError) {
              console.warn('Archivo subido pero no registrado en DB:', dbError.message);
            }

            uploaded++;
            if (badge) { badge.textContent = '✓ Subido'; badge.className = 'badge badge-success'; }
            if (itemEl) itemEl.style.opacity = '0.6';
          } else {
            // Fallback local sin Supabase
            setTimeout(() => {
              if (badge) { badge.textContent = '✓ Listo (local)'; badge.className = 'badge badge-success'; }
            }, 300);
            uploaded++;
          }
        } catch (err) {
          failed++;
          if (badge) { badge.textContent = 'Error'; badge.className = 'badge badge-danger'; }
          Components.showToast({ message: `"${fileData.name}": ${err.message}`, type: 'error' });
        }
      }

      btn.disabled = false;
      btn.innerHTML = `${Components.icon('upload')} Subir archivos`;

      if (uploaded > 0) {
        Components.showToast({
          message: `${uploaded} archivo(s) subido(s) correctamente${failed > 0 ? `, ${failed} fallido(s)` : ''}.`,
          type: failed > 0 ? 'warning' : 'success',
          duration: 5000
        });
      }
    });

    renderArchivosLista();
  }

  function base64ToFile(dataUrl, fileName, mimeType) {
    if (!dataUrl) return new File([new Blob([''])], fileName, { type: mimeType || 'application/octet-stream' });
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], fileName, { type: mimeType || 'application/octet-stream' });
  }

  /* ============================================================
     MÓDULO: FINANZAS
     ============================================================ */
  function renderFinanzas(container) {
    const finanzas = ClinicaData.finanzas;
    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Ingresos del Día</div><div class="kpi-value">S/ ${finanzas.ingresosHoy.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Efectivo</div><div class="kpi-value">S/ ${finanzas.metodosPago[0].monto.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Tarjeta</div><div class="kpi-value">S/ ${finanzas.metodosPago[1].monto.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Yape/PLIN</div><div class="kpi-value">S/ ${finanzas.metodosPago[2].monto.toLocaleString()}</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>${Components.icon('wallet2')} Registrar Pago</h3></div>
          <div class="form-group">
            <label>Paciente</label>
            <select class="form-control" id="pagoPaciente">
              <option value="">-- Seleccione --</option>
              ${ClinicaData.pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Concepto</label>
            <input type="text" class="form-control" id="pagoConcepto" placeholder="Ej: Consulta Cardiología">
          </div>
          <div class="form-group">
            <label>Monto (S/)</label>
            <input type="number" class="form-control" id="pagoMonto" placeholder="0.00" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label>Método de Pago</label>
            <div class="payment-methods">
              <button class="payment-btn" data-metodo="efectivo">
                <span class="pay-icon">${Components.icon('cash', 'bi-icon-xl')}</span>
                <span class="pay-label">Efectivo</span>
                <span class="pay-sub">Pago en efectivo</span>
              </button>
              <button class="payment-btn" data-metodo="tarjeta">
                <span class="pay-icon">${Components.icon('credit-card', 'bi-icon-xl')}</span>
                <span class="pay-label">Tarjeta</span>
                <span class="pay-sub">Débito/Crédito</span>
              </button>
              <button class="payment-btn" data-metodo="yape">
                <span class="pay-icon">${Components.icon('phone', 'bi-icon-xl')}</span>
                <span class="pay-label">Yape/PLIN</span>
                <span class="pay-sub">Transferencia móvil</span>
              </button>
            </div>
          </div>
          <button class="btn btn-success btn-full" id="btnGuardarPago">${Components.icon('check2-circle')} Guardar Pago</button>
        </div>
        <div class="card">
          <div class="card-header"><h3>${Components.icon('receipt')} Últimas Transacciones</h3></div>
          <div class="table-container">
            <table>
              <thead><tr><th>Paciente</th><th>Concepto</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                ${finanzas.transacciones.map(t => `
                  <tr>
                    <td>${t.paciente}</td>
                    <td>${t.concepto}</td>
                    <td>S/ ${t.monto}</td>
                    <td>${Components.createBadge(t.estado, t.estado === 'Pagado' ? 'success' : 'warning').outerHTML}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    // Payment method selection
    document.querySelectorAll('.payment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // Save payment
    document.getElementById('btnGuardarPago')?.addEventListener('click', () => {
      const metodoEl = document.querySelector('.payment-btn.active');
      if (!metodoEl) { Components.showToast({ message: 'Seleccione un método de pago.', type: 'warning' }); return; }
      const pacienteId = parseInt(document.getElementById('pagoPaciente').value);
      const concepto = document.getElementById('pagoConcepto').value.trim();
      const monto = parseFloat(document.getElementById('pagoMonto').value);
      if (!pacienteId) { Components.showToast({ message: 'Seleccione un paciente.', type: 'warning' }); return; }
      if (!concepto) { Components.showToast({ message: 'Ingrese el concepto del pago.', type: 'warning' }); return; }
      if (!monto || monto <= 0) { Components.showToast({ message: 'Ingrese un monto válido.', type: 'warning' }); return; }
      const metodoTexto = metodoEl.querySelector('.pay-label')?.textContent || metodoEl.dataset.metodo;
      const metodoCapitalizado = metodoTexto.charAt(0).toUpperCase() + metodoTexto.slice(1);
      const paciente = ClinicaData.pacientes.find(p => p.id === pacienteId);
      const transaccion = {
        id: ClinicaData.nextId('transacciones'),
        paciente: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Desconocido',
        concepto,
        monto,
        metodo: metodoCapitalizado,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Pagado'
      };
      ClinicaData.finanzas.transacciones.unshift(transaccion);
      ClinicaData.finanzas.ingresosHoy += monto;
      const metodoIdx = ClinicaData.finanzas.metodosPago.findIndex(m =>
        m.metodo.toLowerCase() === metodoCapitalizado.toLowerCase()
      );
      if (metodoIdx >= 0) ClinicaData.finanzas.metodosPago[metodoIdx].monto += monto;
      // Re-render finances
      renderFinanzas(document.getElementById('moduleContent'));
      Components.showToast({ message: `Pago de S/ ${monto.toFixed(2)} registrado correctamente.`, type: 'success' });
    });
    refreshPatientSelectors();
  }

  /* ============================================================
     MÓDULO: ADMINISTRACIÓN
     ============================================================ */
  function renderAdministracion(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${Components.icon('gear')} Especialidades Médicas</h3>
          <button class="btn btn-primary btn-sm" id="btnNuevaEspecialidad">${Components.icon('plus-lg')} Nueva Especialidad</button>
        </div>
        <div id="especialidadesLista"></div>
      </div>
    `;
    renderEspecialidadesLista();
    document.getElementById('btnNuevaEspecialidad')?.addEventListener('click', () => {
      Components.showModal({
        title: 'Nueva Especialidad',
        content: `
          <div class="form-group">
            <label>Nombre de la especialidad</label>
            <input type="text" class="form-control" id="nuevaEspNombre" placeholder="Ej: Neurología">
          </div>
          <div class="form-group">
            <label>Cantidad de médicos</label>
            <input type="number" class="form-control" id="nuevaEspMedicos" value="1" min="1">
          </div>
        `,
        onConfirm: () => {
          const nombre = document.getElementById('nuevaEspNombre').value.trim();
          if (!nombre) { Components.showToast({ message: 'Ingrese el nombre de la especialidad.', type: 'warning' }); return false; }
          ClinicaData.especialidades.push({
            id: ClinicaData.nextId('especialidades'),
            nombre,
            medicos: parseInt(document.getElementById('nuevaEspMedicos').value) || 1,
            activo: true
          });
          renderEspecialidadesLista();
          Components.showToast({ message: `Especialidad "${nombre}" creada.`, type: 'success' });
        }
      });
    });
  }

  function renderEspecialidadesLista() {
    const container = document.getElementById('especialidadesLista');
    container.innerHTML = ClinicaData.especialidades.map(e => `
      <div class="specialty-item">
        <div class="specialty-info">
          <span class="specialty-name">${e.nombre}</span>
          <span class="specialty-count">${e.medicos} médicos</span>
          ${Components.createBadge(e.activo ? 'Activo' : 'Inactivo', e.activo ? 'success' : 'danger').outerHTML}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-outline btn-sm btn-edit-especialidad" data-id="${e.id}">${Components.icon('pencil')}</button>
          <button class="btn btn-danger btn-sm btn-delete-especialidad" data-id="${e.id}">${Components.icon('trash')}</button>
        </div>
      </div>
    `).join('');

    // Delete with inline confirmation
    function handleDeleteClick(ev) {
      const btn = ev.currentTarget;
      const parent = btn.closest('.specialty-item');
      const actionsDiv = Array.from(parent.children).find(c => c.style.display !== 'none') || parent.querySelector('[style*="display:flex"]') || parent.lastElementChild;
      if (btn.dataset.confirming === 'true') return;
      btn.dataset.confirming = 'true';
      const origHTML = actionsDiv.innerHTML;
      actionsDiv.innerHTML = `
        <div class="inline-confirm">
          <span>¿Confirmar?</span>
          <button class="btn btn-danger btn-sm btn-confirm-delete">Sí</button>
          <button class="btn btn-outline btn-sm btn-cancel-delete">No</button>
        </div>
      `;
      actionsDiv.querySelector('.btn-confirm-delete')?.addEventListener('click', () => {
        const espId = parseInt(btn.dataset.id);
        const idx = ClinicaData.especialidades.findIndex(e => e.id === espId);
        if (idx >= 0) ClinicaData.especialidades.splice(idx, 1);
        parent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        parent.style.opacity = '0';
        parent.style.transform = 'translateX(-20px)';
        setTimeout(() => { parent.remove(); Components.showToast({ message: 'Especialidad eliminada.', type: 'success' }); }, 300);
      });
      actionsDiv.querySelector('.btn-cancel-delete')?.addEventListener('click', () => {
        actionsDiv.innerHTML = origHTML;
        const newBtn = actionsDiv.querySelector('.btn-delete-especialidad');
        if (newBtn) {
          newBtn.dataset.confirming = 'false';
          newBtn.addEventListener('click', handleDeleteClick);
        }
      });
    }
    document.querySelectorAll('.btn-delete-especialidad').forEach(btn => {
      btn.addEventListener('click', handleDeleteClick);
    });
    document.querySelectorAll('.btn-edit-especialidad').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        const esp = ClinicaData.especialidades.find(e => e.id === id);
        if (!esp) return;
        Components.showModal({
          title: 'Editar Especialidad',
          confirmText: 'Guardar Cambios',
          content: `
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" class="form-control" id="editEspNombre" value="${esp.nombre}">
            </div>
            <div class="form-group">
              <label>Médicos</label>
              <input type="number" class="form-control" id="editEspMedicos" value="${esp.medicos}" min="0">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select class="form-control" id="editEspEstado">
                <option value="true" ${esp.activo ? 'selected' : ''}>Activo</option>
                <option value="false" ${!esp.activo ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          `,
          onConfirm: () => {
            esp.nombre = document.getElementById('editEspNombre').value.trim() || esp.nombre;
            esp.medicos = parseInt(document.getElementById('editEspMedicos').value) || 0;
            esp.activo = document.getElementById('editEspEstado').value === 'true';
            renderEspecialidadesLista();
            Components.showToast({ message: `Especialidad "${esp.nombre}" actualizada.`, type: 'success' });
          }
        });
      });
    });
  }

  /* === PILL TABS HELPER === */
  function bindPillTabs(tabsId, contentIds) {
    const tabsContainer = document.getElementById(tabsId);
    if (!tabsContainer) return;
    tabsContainer.querySelectorAll('.pill-tab').forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.pill-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        contentIds.forEach(cid => {
          const el = document.getElementById(cid);
          if (el) el.classList.remove('active');
        });
        const target = document.getElementById(contentIds[idx]);
        if (target) {
          target.classList.add('active');
          target.className = 'pill-tab-content';
          void target.offsetWidth;
          target.className = 'pill-tab-content active';
        }
      });
    });
  }

  function refreshPatientSelectors() {
    const selects = document.querySelectorAll('[id$="PacienteSelect"], [id="pagoPaciente"], [id="citaPaciente"]');
    const options = ClinicaData.pacientes.map(p =>
      `<option value="${p.id}">${p.nombre} ${p.apellido}${p.dni ? ' (' + p.dni + ')' : ''}</option>`
    ).join('');
    selects.forEach(sel => {
      if (!sel) return;
      const currentVal = sel.value;
      const emptyOpt = sel.querySelector('option[value=""]');
      sel.innerHTML = '';
      if (emptyOpt || sel.id === 'pagoPaciente' || sel.id === 'citaPaciente' || sel.id === 'historialPacienteSelect') {
        sel.appendChild(new Option('-- Seleccione --', ''));
      }
      sel.insertAdjacentHTML('beforeend', options);
      if (currentVal && sel.querySelector(`option[value="${currentVal}"]`)) {
        sel.value = currentVal;
      }
    });
  }

  function verCita(id) {
    const c = ClinicaData.citas.find(ci => ci.id === id);
    if (!c) return;
    const p = ClinicaData.pacientes.find(pac => pac.id === c.pacienteId);
    const m = ClinicaData.medicos.find(med => med.id === c.medicoId);
    Components.showModal({
      title: 'Detalle de Cita',
      content: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="grid-column:1/-1;"><strong>Paciente:</strong> ${p ? p.nombre + ' ' + p.apellido : '-'}</div>
          <div><strong>Especialidad:</strong> ${c.especialidad}</div>
          <div><strong>Médico:</strong> ${m ? m.nombre : '-'}</div>
          <div><strong>Fecha:</strong> ${Components.formatFecha(c.fecha)}</div>
          <div><strong>Hora:</strong> ${c.hora}</div>
          <div><strong>Estado:</strong> ${Components.createBadge(c.estado, c.estado === 'Confirmada' ? 'primary' : c.estado === 'Pendiente' ? 'warning' : c.estado === 'Atendida' ? 'success' : 'danger').outerHTML}</div>
          <div style="grid-column:1/-1;"><strong>Motivo:</strong> ${c.motivo || '-'}</div>
        </div>
      `,
      showConfirm: false,
      cancelText: 'Cerrar'
    });
  }

  /* === PUBLIC HELPERS (used from inline onclick) === */
  function verPaciente(id) {
    const p = ClinicaData.pacientes.find(pac => pac.id === id);
    if (!p) return;
    const hc = ClinicaData.historiasClinicas.find(h => h.pacienteId === id);
    Components.showModal({
      title: 'Detalle del Paciente',
      content: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><strong>DNI:</strong> ${p.dni}</div>
          <div><strong>Edad:</strong> ${p.edad} años</div>
          <div style="grid-column:1/-1;"><strong>Nombre:</strong> ${p.nombre} ${p.apellido}</div>
          <div><strong>Teléfono:</strong> ${p.telefono || '-'}</div>
          <div><strong>Email:</strong> ${p.email || '-'}</div>
          <div style="grid-column:1/-1;"><strong>Dirección:</strong> ${p.direccion || '-'}</div>
          <div><strong>Seguro:</strong> ${p.seguro}</div>
          <div><strong>Registro:</strong> ${Components.formatFecha(p.fechaRegistro)}</div>
        </div>
        ${hc ? `
        <hr style="margin:16px 0;border-color:var(--color-gray-200);">
        <p><strong>Última Historia Clínica:</strong></p>
        <p style="font-size:0.85rem;color:var(--color-gray-500);">${hc.especialidad.nombre} · ${hc.medico} · ${Components.formatFecha(hc.fecha)}</p>
        <p style="font-size:0.88rem;"><em>${hc.motivo.substring(0, 100)}${hc.motivo.length > 100 ? '...' : ''}</em></p>
        ` : '<hr style="margin:16px 0;border-color:var(--color-gray-200);"><p style="color:var(--color-gray-400);">Sin historial clínico.</p>'}
      `,
      showConfirm: false,
      cancelText: 'Cerrar'
    });
  }
  function editarPaciente(id) {
    const p = ClinicaData.pacientes.find(pac => pac.id === id);
    if (!p) return;
    Components.showModal({
      title: 'Editar Paciente',
      confirmText: 'Guardar Cambios',
      content: `
        <div class="form-group">
          <label>DNI</label>
          <input type="text" class="form-control" id="editPDni" value="${p.dni}" maxlength="8">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nombres</label>
            <input type="text" class="form-control" id="editPNombres" value="${p.nombre}">
          </div>
          <div class="form-group">
            <label>Apellidos</label>
            <input type="text" class="form-control" id="editPApellidos" value="${p.apellido}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Edad</label>
            <input type="number" class="form-control" id="editPEdad" value="${p.edad}" min="0" max="120">
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" class="form-control" id="editPTelefono" value="${p.telefono || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" id="editPEmail" value="${p.email || ''}">
          </div>
          <div class="form-group">
            <label>Seguro</label>
            <select class="form-control" id="editPSeguro">
              <option value="SIS" ${p.seguro === 'SIS' ? 'selected' : ''}>SIS</option>
              <option value="EsSalud" ${p.seguro === 'EsSalud' ? 'selected' : ''}>EsSalud</option>
              <option value="Particular" ${p.seguro === 'Particular' ? 'selected' : ''}>Particular</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <input type="text" class="form-control" id="editPDireccion" value="${p.direccion || ''}">
        </div>
      `,
      onConfirm: () => {
        const nuevoDni = document.getElementById('editPDni').value.trim();
        if (nuevoDni !== p.dni && PacienteService.buscarPorDni(nuevoDni)) {
          Components.showToast({ message: `El DNI ${nuevoDni} ya está registrado por otro paciente.`, type: 'error', duration: 5000 });
          return false;
        }
        p.dni = nuevoDni;
        p.nombre = document.getElementById('editPNombres').value.trim();
        p.apellido = document.getElementById('editPApellidos').value.trim();
        p.edad = parseInt(document.getElementById('editPEdad').value);
        p.telefono = document.getElementById('editPTelefono').value.trim();
        p.email = document.getElementById('editPEmail').value.trim();
        p.seguro = document.getElementById('editPSeguro').value;
        p.direccion = document.getElementById('editPDireccion').value.trim();
        renderPacientesTableRows();
        refreshPatientSelectors();
        Components.showToast({ message: 'Paciente actualizado correctamente.', type: 'success' });
      }
    });
  }

  /* === BOOT === */
  document.addEventListener('DOMContentLoaded', init);

  return { init, verPaciente, editarPaciente, verCita };
})();

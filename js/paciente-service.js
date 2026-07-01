const POSTMAN_MOCK_URL = 'https://70765311-dec6-4f8d-983d-fdf68415e39d.mock.pstmn.io/registrar-paciente';

const PacienteService = (() => {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function buscarPorDni(dni) {
    return ClinicaData.pacientes.find(p => p.dni === dni) || null;
  }

  async function registrarEnPostman(datosPaciente) {
    try {
      const respuesta = await fetch(POSTMAN_MOCK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPaciente)
      });
      const resultado = await respuesta.json();
      console.log('Respuesta de Postman:', resultado);
      return resultado;
    } catch (error) {
      console.error('Error en la simulación Postman:', error);
      return null;
    }
  }

  async function registrar(data) {
    const validacion = Validators.validarPaciente(data);
    if (!validacion.valid) {
      return { success: false, status: 400, errores: validacion.errores };
    }

    const existente = buscarPorDni(data.dni);
    if (existente) {
      return {
        success: false,
        status: 409,
        error: `El DNI ${data.dni} ya está registrado para ${existente.nombre} ${existente.apellido}.`,
        pacienteExistente: existente
      };
    }

    let edad = parseInt(data.edad);
    if (data.fechaNacimiento && isNaN(edad)) {
      edad = Validators.calcularEdad(data.fechaNacimiento);
    }

    const nuevoPaciente = {
      id: ClinicaData.nextId('pacientes'),
      dni: data.dni,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      edad: edad || 0,
      fechaNacimiento: data.fechaNacimiento || '',
      telefono: data.telefono ? data.telefono.trim() : '',
      email: data.email ? data.email.trim() : '',
      direccion: data.direccion ? data.direccion.trim() : '',
      seguro: data.seguro || 'Particular',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    if (SupabaseService.isAvailable()) {
      try {
        const url = SUPABASE_URL + '/rest/v1/paciente';
        const anonKey = SUPABASE_ANON_KEY;
        const body = {
          dni: nuevoPaciente.dni,
          nombre: nuevoPaciente.nombre,
          apellido: nuevoPaciente.apellido,
          fecha_nac: nuevoPaciente.fechaNacimiento || null,
          genero: data.genero || null,
          telefono: nuevoPaciente.telefono || null,
          email: nuevoPaciente.email || null,
          direccion: nuevoPaciente.direccion || null
        };
        const response = await fetch(url + '?select=*', {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: 'Bearer ' + anonKey,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 409) {
            return { success: false, status: 409, error: `El DNI ${data.dni} ya existe en la base de datos.` };
          }
          console.warn('Supabase REST insert error (' + response.status + '), usando fallback local:', errText);
        } else {
          const result = await response.json();
          if (Array.isArray(result) && result.length > 0) {
            nuevoPaciente.id = result[0].id;
          }
        }
      } catch (err) {
        console.warn('Supabase error, usando fallback local:', err.message);
      }
    }

    ClinicaData.pacientes.push(nuevoPaciente);

      registrarEnPostman({
      dni: nuevoPaciente.dni,
      nombre: nuevoPaciente.nombre,
      apellido: nuevoPaciente.apellido,
      fecha_nac: nuevoPaciente.fechaNacimiento,
      telefono: nuevoPaciente.telefono,
      email: nuevoPaciente.email,
      direccion: nuevoPaciente.direccion
    });

    return { success: true, status: 201, paciente: nuevoPaciente };
  }

  function getAll() {
    return [...ClinicaData.pacientes];
  }

  function getById(id) {
    return ClinicaData.pacientes.find(p => p.id === id) || null;
  }

  function actualizar(id, data) {
    const idx = ClinicaData.pacientes.findIndex(p => p.id === id);
    if (idx === -1) return { success: false, status: 404, error: 'Paciente no encontrado.' };
    const p = ClinicaData.pacientes[idx];
    if (data.dni && data.dni !== p.dni) {
      const dup = buscarPorDni(data.dni);
      if (dup) return { success: false, status: 409, error: `El DNI ${data.dni} ya está registrado.` };
    }
    Object.assign(p, data);
    if (p.fechaNacimiento && !data.edad) {
      p.edad = Validators.calcularEdad(p.fechaNacimiento) || p.edad;
    }
    return { success: true, status: 200, paciente: p };
  }

  return { registrar, getAll, getById, actualizar, buscarPorDni, registrarEnPostman };
})();

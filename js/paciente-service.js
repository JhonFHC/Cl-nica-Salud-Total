const PacienteService = (() => {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function buscarPorDni(dni) {
    return ClinicaData.pacientes.find(p => p.dni === dni) || null;
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
        const sb = SupabaseService.getClient();
        const { data: insertData, error } = await sb.from('pacientes').insert({
          dni: nuevoPaciente.dni,
          nombres: nuevoPaciente.nombre,
          apellidos: nuevoPaciente.apellido,
          fecha_nacimiento: nuevoPaciente.fechaNacimiento || null,
          telefono: nuevoPaciente.telefono || null,
          correo: nuevoPaciente.email || null,
          direccion: nuevoPaciente.direccion || null,
          seguro: nuevoPaciente.seguro
        }).select().single();
        if (error) {
          if (error.code === '23505') {
            return { success: false, status: 409, error: `El DNI ${data.dni} ya existe en la base de datos.` };
          }
          console.warn('Supabase insert error, usando fallback local:', error.message);
        } else if (insertData) {
          nuevoPaciente.id = insertData.id;
        }
      } catch (err) {
        console.warn('Supabase error, usando fallback local:', err.message);
      }
    }

    ClinicaData.pacientes.push(nuevoPaciente);
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

  return { registrar, getAll, getById, actualizar, buscarPorDni };
})();

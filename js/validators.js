const Validators = (() => {
  const DNI_REGEX = /^\d{8}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[9]\d{8}$/;

  function required(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return { valid: false, error: `El campo "${fieldName}" es obligatorio.` };
    }
    return { valid: true };
  }

  function validarDNI(dni) {
    if (!dni || !DNI_REGEX.test(dni)) {
      return { valid: false, error: 'El DNI debe tener exactamente 8 dígitos numéricos.' };
    }
    return { valid: true };
  }

  function validarEmail(email) {
    if (!email || email.trim().length === 0) return { valid: true };
    if (!EMAIL_REGEX.test(email)) {
      return { valid: false, error: 'El formato del correo electrónico no es válido.' };
    }
    return { valid: true };
  }

  function validarTelefono(telefono) {
    if (!telefono || telefono.trim().length === 0) return { valid: true };
    if (!PHONE_REGEX.test(telefono.replace(/\s/g, ''))) {
      return { valid: false, error: 'El teléfono debe tener 9 dígitos y comenzar con 9.' };
    }
    return { valid: true };
  }

  function validarEdad(edad) {
    const num = parseInt(edad);
    if (isNaN(num) || num < 0 || num > 120) {
      return { valid: false, error: 'La edad debe estar entre 0 y 120 años.' };
    }
    return { valid: true };
  }

  function validarFechaNacimiento(fecha) {
    if (!fecha) return { valid: true };
    const d = new Date(fecha + 'T00:00:00');
    if (isNaN(d.getTime()) || d > new Date()) {
      return { valid: false, error: 'La fecha de nacimiento no es válida o es futura.' };
    }
    return { valid: true };
  }

  function validarPaciente(data) {
    const errores = [];
    const fields = [
      { key: 'dni', fn: validarDNI },
      { key: 'nombre', fn: (v) => required(v, 'Nombres') },
      { key: 'apellido', fn: (v) => required(v, 'Apellidos') },
      { key: 'edad', fn: validarEdad },
      { key: 'email', fn: validarEmail },
      { key: 'telefono', fn: validarTelefono },
      { key: 'fechaNacimiento', fn: validarFechaNacimiento }
    ];
    fields.forEach(({ key, fn }) => {
      const result = fn(data[key]);
      if (!result.valid) errores.push(result.error);
    });
    return { valid: errores.length === 0, errores };
  }

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nac = new Date(fechaNacimiento + 'T00:00:00');
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  return { required, validarDNI, validarEmail, validarTelefono, validarEdad, validarFechaNacimiento, validarPaciente, calcularEdad, DNI_REGEX, EMAIL_REGEX, PHONE_REGEX };
})();

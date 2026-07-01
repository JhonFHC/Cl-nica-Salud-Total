/**
 * Tests unitarios para el servicio de validación de DNI duplicado
 * y registro de pacientes.
 *
 * Ejecutar abriendo tests/test-runner.html en el navegador.
 */

const TestsPacientes = (() => {
  let passed = 0;
  let failed = 0;
  const results = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
      results.push(`  ✅ ${message}`);
    } else {
      failed++;
      results.push(`  ❌ ${message}`);
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual === expected) {
      passed++;
      results.push(`  ✅ ${message}`);
    } else {
      failed++;
      results.push(`  ❌ ${message} — esperado: ${JSON.stringify(expected)}, obtenido: ${JSON.stringify(actual)}`);
    }
  }

  function assertDeepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) {
      passed++;
      results.push(`  ✅ ${message}`);
    } else {
      failed++;
      results.push(`  ❌ ${message} — esperado: ${e}, obtenido: ${a}`);
    }
  }

  /* ============================================================
     Test Suite: Validators.validarDNI
     ============================================================ */
  function testValidarDNI() {
    results.push('\n📋 Test: Validators.validarDNI()');

    assertEqual(Validators.validarDNI('').valid, false, 'DNI vacío es inválido');
    assertEqual(Validators.validarDNI('1234567').valid, false, 'DNI con 7 dígitos es inválido');
    assertEqual(Validators.validarDNI('123456789').valid, false, 'DNI con 9 dígitos es inválido');
    assertEqual(Validators.validarDNI('1234567a').valid, false, 'DNI con letras es inválido');
    assertEqual(Validators.validarDNI('ABCDEFGH').valid, false, 'DNI solo letras es inválido');
    assertEqual(Validators.validarDNI('12345678').valid, true, 'DNI con 8 dígitos numéricos es válido');
    assertEqual(Validators.validarDNI('00000001').valid, true, 'DNI 00000001 es válido');
    assertEqual(Validators.validarDNI(null).valid, false, 'DNI null es inválido');
    assertEqual(Validators.validarDNI(undefined).valid, false, 'DNI undefined es inválido');
    assert(Validators.validarDNI('45236789').valid, 'DNI existente en mock data es válido');
  }

  /* ============================================================
     Test Suite: Validators.validarEmail
     ============================================================ */
  function testValidarEmail() {
    results.push('\n📋 Test: Validators.validarEmail()');

    assertEqual(Validators.validarEmail('').valid, true, 'Email vacío es válido (opcional)');
    assertEqual(Validators.validarEmail('correo@dominio.com').valid, true, 'Email correcto es válido');
    assertEqual(Validators.validarEmail('correo@').valid, false, 'Email sin dominio es inválido');
    assertEqual(Validators.validarEmail('correo').valid, false, 'Email sin @ es inválido');
    assertEqual(Validators.validarEmail('@dominio.com').valid, false, 'Email sin usuario es inválido');
    assertEqual(Validators.validarEmail('correo@dominio').valid, false, 'Email sin TLD es inválido');
    assertEqual(Validators.validarEmail('correo@dominio.co').valid, true, 'Email con .co es válido');
  }

  /* ============================================================
     Test Suite: Validators.validarTelefono
     ============================================================ */
  function testValidarTelefono() {
    results.push('\n📋 Test: Validators.validarTelefono()');

    assertEqual(Validators.validarTelefono('').valid, true, 'Teléfono vacío es válido (opcional)');
    assertEqual(Validators.validarTelefono('987654321').valid, true, 'Teléfono 9 dígitos que empieza con 9 es válido');
    assertEqual(Validators.validarTelefono('123456789').valid, false, 'Teléfono que empieza con 1 es inválido');
    assertEqual(Validators.validarTelefono('98765432').valid, false, 'Teléfono con 8 dígitos es inválido');
    assertEqual(Validators.validarTelefono('9876543210').valid, false, 'Teléfono con 10 dígitos es inválido');
    assertEqual(Validators.validarTelefono('98765a321').valid, false, 'Teléfono con letras es inválido');
  }

  /* ============================================================
     Test Suite: Validators.validarPaciente (campos requeridos)
     ============================================================ */
  function testValidarPacienteRequeridos() {
    results.push('\n📋 Test: Validators.validarPaciente() — campos requeridos');

    const vacio = Validators.validarPaciente({ dni: '', nombre: '', apellido: '', edad: '' });
    assertEqual(vacio.valid, false, 'Todos los campos vacíos → inválido');
    assert(vacio.errores.length >= 3, 'Debe tener al menos 3 errores');

    const soloNombre = Validators.validarPaciente({ dni: '12345678', nombre: 'Juan', apellido: '', edad: '' });
    assertEqual(soloNombre.valid, false, 'Faltan apellidos y edad → inválido');

    const completo = Validators.validarPaciente({ dni: '12345678', nombre: 'Juan', apellido: 'Pérez', edad: '30' });
    assertEqual(completo.valid, true, 'Todos los campos requeridos presentes → válido');

    const conEmailInvalido = Validators.validarPaciente({ dni: '12345678', nombre: 'Juan', apellido: 'Pérez', edad: '30', email: 'invalido' });
    assertEqual(conEmailInvalido.valid, false, 'Email inválido → inválido');
  }

  /* ============================================================
     Test Suite: PacienteService.buscarPorDni (duplicados)
     ============================================================ */
  function testBuscarPorDniDuplicado() {
    results.push('\n📋 Test: PacienteService.buscarPorDni() — DNI duplicado');

    const existente = PacienteService.buscarPorDni('45236789');
    assert(existente !== null, 'DNI existente en data.js debe ser encontrado');
    assertEqual(existente.nombre, 'Ana María', 'Debe retornar el paciente correcto');

    const inexistente = PacienteService.buscarPorDni('99999999');
    assertEqual(inexistente, null, 'DNI no registrado debe retornar null');
  }

  /* ============================================================
     Test Suite: PacienteService.registrar (duplicado → 409)
     ============================================================ */
  async function testRegistrarDuplicado() {
    results.push('\n📋 Test: PacienteService.registrar() — DNI duplicado devuelve 409');

    const result = await PacienteService.registrar({
      dni: '45236789',
      nombre: 'Duplicado',
      apellido: 'Test',
      edad: '25',
      telefono: '',
      email: '',
      fechaNacimiento: ''
    });

    assertEqual(result.status, 409, 'Registrar con DNI existente debe devolver status 409');
    assertEqual(result.success, false, 'Debe indicar success = false');
    assert(result.error.includes('45236789'), 'El mensaje de error debe incluir el DNI');
    assert(result.pacienteExistente !== undefined, 'Debe incluir el paciente existente');
  }

  /* ============================================================
     Test Suite: PacienteService.registrar (nuevo → 201)
     ============================================================ */
  async function testRegistrarNuevo() {
    results.push('\n📋 Test: PacienteService.registrar() — Nuevo paciente devuelve 201');

    const dniUnico = '99999999';
    const result = await PacienteService.registrar({
      dni: dniUnico,
      nombre: 'Test',
      apellido: 'Unitario',
      edad: '35',
      fechaNacimiento: '1990-05-15',
      telefono: '987654321',
      email: 'test@correo.com',
      direccion: 'Av. Test 123',
      seguro: 'Particular'
    });

    assertEqual(result.status, 201, 'Nuevo paciente debe devolver status 201');
    assertEqual(result.success, true, 'Debe indicar success = true');
    assert(result.paciente !== undefined, 'Debe incluir el paciente creado');
    assertEqual(result.paciente.dni, dniUnico, 'El DNI debe coincidir');
    assertEqual(result.paciente.nombre, 'Test', 'El nombre debe coincidir');
    assert(result.paciente.id > 0, 'Debe tener un ID generado');

    // Verificar que se agregó a ClinicaData
    const enData = PacienteService.buscarPorDni(dniUnico);
    assert(enData !== null, 'El paciente debe estar en ClinicaData.pacientes');
    assertEqual(enData.id, result.paciente.id, 'El ID debe coincidir con el registrado');
  }

  /* ============================================================
     Test Suite: Validators.calcularEdad
     ============================================================ */
  function testCalcularEdad() {
    results.push('\n📋 Test: Validators.calcularEdad()');

    assertEqual(Validators.calcularEdad(''), null, 'Fecha vacía retorna null');
    assertEqual(Validators.calcularEdad(null), null, 'Fecha null retorna null');

    const hoy = new Date();
    const hace20 = new Date(hoy.getFullYear() - 20, hoy.getMonth(), hoy.getDate());
    const fechaStr = hace20.toISOString().split('T')[0];
    assertEqual(Validators.calcularEdad(fechaStr), 20, 'Calcula edad correctamente para 20 años exactos');
  }

  /* ============================================================
     Correr todas las suites
     ============================================================ */
  async function runAll() {
    passed = 0;
    failed = 0;
    results.length = 0;
    results.push('🧪 Tests del Sistema de Pacientes — ClinicaSoft\n');
    results.push(`Iniciado: ${new Date().toLocaleString()}\n`);

    testValidarDNI();
    testValidarEmail();
    testValidarTelefono();
    testValidarPacienteRequeridos();
    testBuscarPorDniDuplicado();
    testCalcularEdad();
    await testRegistrarDuplicado();
    await testRegistrarNuevo();

    results.push('\n' + '='.repeat(50));
    results.push(`Resultados: ${passed} pasaron, ${failed} fallaron`);
    if (failed === 0) results.push('🎉 Todos los tests pasaron correctamente.');

    return { passed, failed, output: results.join('\n') };
  }

  return { runAll };
})();

// Auto-ejecutar si estamos en un navegador
if (typeof window !== 'undefined') {
  window.runPacienteTests = TestsPacientes.runAll;
}

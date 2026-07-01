const ClinicaData = {
  usuarios: [
    { id: 1, nombre: 'Dr. Carlos Mendoza', email: 'admin@clinica.com', password: 'admin123', rol: 'admin', avatar: null },
    { id: 2, nombre: 'Dra. María López', email: 'medico@clinica.com', password: 'medico123', rol: 'medico', avatar: null },
    { id: 3, nombre: 'Sofía Ramírez', email: 'recepcion@clinica.com', password: 'recepcion123', rol: 'recepcion', avatar: null },
    { id: 4, nombre: 'Pedro Castillo', email: 'farmacia@clinica.com', password: 'farmacia123', rol: 'farmacia', avatar: null }
  ],

  roles: {
    admin: { label: 'Administrador', modulos: ['Dashboard', 'Pacientes', 'Citas Médicas', 'Historia Clínica', 'Finanzas', 'Administración'] },
    medico: { label: 'Médico', modulos: ['Dashboard', 'Citas Médicas', 'Historia Clínica'] },
    recepcion: { label: 'Recepción', modulos: ['Dashboard', 'Pacientes', 'Citas Médicas', 'Finanzas'] },
    farmacia: { label: 'Farmacia', modulos: ['Dashboard', 'Historia Clínica'] }
  },

  pacientes: [
    { id: 1, dni: '45236789', nombre: 'Ana María', apellido: 'Gutiérrez Pérez', edad: 34, fechaNacimiento: '1991-03-15', telefono: '987654321', email: 'ana.gutierrez@email.com', direccion: 'Av. Los Olivos 123', seguro: 'SIS', fechaRegistro: '2025-01-15' },
    { id: 2, dni: '47891234', nombre: 'Roberto Carlos', apellido: 'Huamán Torres', edad: 52, fechaNacimiento: '1973-08-22', telefono: '976543210', email: 'roberto.huaman@email.com', direccion: 'Jr. Las Flores 456', seguro: 'EsSalud', fechaRegistro: '2025-02-20' },
    { id: 3, dni: '42567890', nombre: 'Carmen Rosa', apellido: 'Luna Vargas', edad: 28, fechaNacimiento: '1997-05-10', telefono: '965432109', email: 'carmen.luna@email.com', direccion: 'Calle Los Pinos 789', seguro: 'Particular', fechaRegistro: '2025-03-10' },
    { id: 4, dni: '46123456', nombre: 'Luis Alberto', apellido: 'Mendoza Ríos', edad: 45, fechaNacimiento: '1980-01-30', telefono: '954321098', email: 'luis.mendoza@email.com', direccion: 'Av. Primavera 321', seguro: 'SIS', fechaRegistro: '2025-03-22' },
    { id: 5, dni: '43987654', nombre: 'Diana Patricia', apellido: 'Castro Morales', edad: 31, fechaNacimiento: '1994-07-18', telefono: '943210987', email: 'diana.castro@email.com', direccion: 'Jr. Las Palmeras 654', seguro: 'EsSalud', fechaRegistro: '2025-04-05' },
    { id: 6, dni: '48765432', nombre: 'Jorge Antonio', apellido: 'Salazar Vega', edad: 60, fechaNacimiento: '1965-02-28', telefono: '932109876', email: 'jorge.salazar@email.com', direccion: 'Av. Central 987', seguro: 'Particular', fechaRegistro: '2025-04-18' },
    { id: 7, dni: '44567891', nombre: 'Mónica Isabel', apellido: 'Ramos Silva', edad: 27, fechaNacimiento: '1998-09-05', telefono: '921098765', email: 'monica.ramos@email.com', direccion: 'Calle Los Claveles 147', seguro: 'SIS', fechaRegistro: '2025-05-02' }
  ],

  especialidades: [
    { id: 1, nombre: 'Cardiología', medicos: 4, activo: true },
    { id: 2, nombre: 'Pediatría', medicos: 3, activo: true },
    { id: 3, nombre: 'Neurología', medicos: 2, activo: true },
    { id: 4, nombre: 'Dermatología', medicos: 5, activo: true },
    { id: 5, nombre: 'Ginecología', medicos: 3, activo: false },
    { id: 6, nombre: 'Traumatología', medicos: 2, activo: true },
    { id: 7, nombre: 'Oftalmología', medicos: 3, activo: true },
    { id: 8, nombre: 'Medicina General', medicos: 6, activo: true }
  ],

  medicos: [
    { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología', cmp: '12345' },
    { id: 2, nombre: 'Dra. María López', especialidad: 'Medicina General', cmp: '23456' },
    { id: 3, nombre: 'Dr. Juan Sánchez', especialidad: 'Cardiología', cmp: '34567' },
    { id: 4, nombre: 'Dra. Rosa Flores', especialidad: 'Pediatría', cmp: '45678' }
  ],

  citas: [
    { id: 1, pacienteId: 1, medicoId: 1, especialidad: 'Cardiología', fecha: '2025-06-29', hora: '08:00', estado: 'Confirmada', motivo: 'Control cardíaco regular' },
    { id: 2, pacienteId: 2, medicoId: 2, especialidad: 'Medicina General', fecha: '2025-06-29', hora: '09:00', estado: 'Pendiente', motivo: 'Dolor abdominal crónico' },
    { id: 3, pacienteId: 3, medicoId: 3, especialidad: 'Cardiología', fecha: '2025-06-29', hora: '10:00', estado: 'Atendida', motivo: 'Electrocardiograma' },
    { id: 4, pacienteId: 4, medicoId: 1, especialidad: 'Cardiología', fecha: '2025-06-29', hora: '11:00', estado: 'Cancelada', motivo: 'Dolor en el pecho' },
    { id: 5, pacienteId: 5, medicoId: 4, especialidad: 'Pediatría', fecha: '2025-06-29', hora: '08:30', estado: 'Confirmada', motivo: 'Control de crecimiento' },
    { id: 6, pacienteId: 6, medicoId: 2, especialidad: 'Medicina General', fecha: '2025-06-30', hora: '09:30', estado: 'Pendiente', motivo: 'Chequeo general' },
    { id: 7, pacienteId: 7, medicoId: 3, especialidad: 'Cardiología', fecha: '2025-06-30', hora: '10:30', estado: 'Pendiente', motivo: 'Palpitaciones' },
    { id: 8, pacienteId: 1, medicoId: 4, especialidad: 'Pediatría', fecha: '2025-06-30', hora: '11:30', estado: 'Confirmada', motivo: 'Control pediátrico' }
  ],

  historiasClinicas: [
    {
      pacienteId: 1,
      especialidad: { id: 1, nombre: 'Cardiología' },
      medico: 'Dr. Carlos Mendoza',
      fecha: '2025-06-28',
      motivo: 'Paciente refiere dolor torácico intermitente de moderada intensidad desde hace aproximadamente 2 semanas. Asocia sensación de falta de aire al realizar esfuerzos moderados. Niega palpitaciones o síncope.',
      examenFisico: 'PA: 130/85 mmHg, FC: 78 lpm, FR: 16 rpm, SatO2: 98%. Auscultación cardiaca: ruidos rítmicos, no se auscultan soplos ni galopes. Auscultación pulmonar: murmullo vesicular pasa bien, no ruidos agregados.',
      cie10: { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
      tratamiento: 'Enalapril 10mg c/12h, Losartán 50mg c/24h, Dieta hiposódica, Ejercicio moderado 30 min diarios',
      examenes: [{ nombre: 'Hemograma completo', resultado: 'Dentro de parámetros normales', fecha: '2025-06-28' }, { nombre: 'Perfil lipídico', resultado: 'Colesterol LDL elevado: 160 mg/dL', fecha: '2025-06-28' }],
      receta: [
        { medicamento: 'Enalapril 10mg', dosis: '1 tableta', frecuencia: 'Cada 12 horas', duracion: '30 días' },
        { medicamento: 'Losartán 50mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', duracion: '30 días' }
      ],
      archivos: []
    },
    {
      pacienteId: 2,
      especialidad: { id: 6, nombre: 'Medicina General' },
      medico: 'Dra. María López',
      fecha: '2025-06-27',
      motivo: 'Paciente acude por dolor abdominal difuso de 3 semanas de evolución. Describe el dolor como tipo cólico, localizado en epigastrio y mesogastrio. Se exacerba después de las comidas. Refiere pirosis ocasional.',
      examenFisico: 'PA: 120/80 mmHg, FC: 72 lpm. Abdomen: blando, depresible, doloroso a la palpación profunda en epigastrio. No signos de irritación peritoneal. RHA presentes.',
      cie10: { codigo: 'K30', descripcion: 'Dispepsia' },
      tratamiento: 'Omeprazol 20mg c/24h, Dieta blanda, Evitar comidas condimentadas y alcohol',
      examenes: [{ nombre: 'Endoscopía digestiva alta', resultado: 'Gastritis antral erosiva leve', fecha: '2025-06-27' }],
      receta: [
        { medicamento: 'Omeprazol 20mg', dosis: '1 cápsula', frecuencia: 'Cada 24 horas en ayunas', duracion: '4 semanas' }
      ],
      archivos: []
    },
    {
      pacienteId: 3,
      especialidad: { id: 1, nombre: 'Cardiología' },
      medico: 'Dr. Juan Sánchez',
      fecha: '2025-06-26',
      motivo: 'Control de electrocardiograma de rutina. Paciente asintomática cardiovascular. Antecedente de soplo cardíaco funcional en la infancia.',
      examenFisico: 'PA: 110/70 mmHg, FC: 65 lpm. Ruidos cardíacos rítmicos, soplo sistólico grado I/VI en foco pulmonar. No edemas.',
      cie10: { codigo: 'R01', descripcion: 'Soplos cardíacos y otros sonidos cardíacos' },
      tratamiento: 'No requiere tratamiento farmacológico. Control anual.',
      examenes: [{ nombre: 'ECG', resultado: 'Ritmo sinusal, eje normal, sin alteraciones', fecha: '2025-06-26' }],
      receta: [],
      archivos: []
    },
    {
      pacienteId: 5,
      especialidad: { id: 2, nombre: 'Pediatría' },
      medico: 'Dra. Rosa Flores',
      fecha: '2025-06-25',
      motivo: 'Control de crecimiento y desarrollo. Paciente de 31 años (madre) acude con su hijo menor para control pediátrico.',
      examenFisico: 'Peso: 12.5 kg, Talla: 88 cm. Percentilos normales para la edad. Desarrollo psicomotor acorde.',
      cie10: { codigo: 'Z00', descripcion: 'Examen general e investigación de personas sin quejas' },
      tratamiento: 'Vacunación según calendario. Suplemento de hierro.',
      examenes: [{ nombre: 'Hemoglobina', resultado: '12.8 g/dL - Normal', fecha: '2025-06-25' }],
      receta: [
        { medicamento: 'Hierro polimaltosado', dosis: '15 gotas', frecuencia: 'Cada 24 horas', duracion: '3 meses' }
      ],
      archivos: []
    }
  ],

  finanzas: {
    ingresosDiarios: [
      { dia: 'Lun', monto: 2850 },
      { dia: 'Mar', monto: 3200 },
      { dia: 'Mié', monto: 2780 },
      { dia: 'Jue', monto: 4100 },
      { dia: 'Vie', monto: 3650 },
      { dia: 'Sáb', monto: 2200 }
    ],
    metodosPago: [{ metodo: 'Efectivo', monto: 5240 }, { metodo: 'Tarjeta', monto: 8760 }, { metodo: 'Yape/PLIN', monto: 3780 }],
    ingresosHoy: 18780,
    pacientesHoy: 42,
    citasPendientes: 8,
    atendidasHoy: 34,
    transacciones: [
      { id: 1, paciente: 'Ana Gutiérrez', concepto: 'Consulta Cardiología', monto: 150, metodo: 'Efectivo', fecha: '2025-06-29', estado: 'Pagado' },
      { id: 2, paciente: 'Roberto Huamán', concepto: 'Consulta Medicina General', monto: 120, metodo: 'Tarjeta', fecha: '2025-06-29', estado: 'Pagado' },
      { id: 3, paciente: 'Carmen Luna', concepto: 'Electrocardiograma', monto: 250, metodo: 'Yape/PLIN', fecha: '2025-06-29', estado: 'Pagado' },
      { id: 4, paciente: 'Luis Mendoza', concepto: 'Consulta Cardiología', monto: 150, metodo: 'Efectivo', fecha: '2025-06-29', estado: 'Pendiente' },
      { id: 5, paciente: 'Diana Castro', concepto: 'Control Pediátrico', monto: 100, metodo: 'Tarjeta', fecha: '2025-06-29', estado: 'Pagado' }
    ]
  },

  _nextId: { pacientes: 8, citas: 9, historiasClinicas: 5, especialidades: 9, transacciones: 6 },

  nextId(key) {
    return ClinicaData._nextId[key]++;
  },

  codigosCIE10: [
    { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
    { codigo: 'I11', descripcion: 'Enfermedad cardíaca hipertensiva' },
    { codigo: 'I20', descripcion: 'Angina de pecho' },
    { codigo: 'I21', descripcion: 'Infarto agudo de miocardio' },
    { codigo: 'I25', descripcion: 'Enfermedad cardíaca isquémica crónica' },
    { codigo: 'I48', descripcion: 'Fibrilación y aleteo auricular' },
    { codigo: 'I50', descripcion: 'Insuficiencia cardíaca' },
    { codigo: 'J00', descripcion: 'Rinofaringitis aguda [resfriado común]' },
    { codigo: 'J02', descripcion: 'Faringitis aguda' },
    { codigo: 'J03', descripcion: 'Amigdalitis aguda' },
    { codigo: 'J06', descripcion: 'Infección aguda de las vías respiratorias superiores' },
    { codigo: 'J15', descripcion: 'Neumonía bacteriana' },
    { codigo: 'J20', descripcion: 'Bronquitis aguda' },
    { codigo: 'J45', descripcion: 'Asma' },
    { codigo: 'E10', descripcion: 'Diabetes mellitus tipo 1' },
    { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' },
    { codigo: 'E78', descripcion: 'Trastornos del metabolismo de las lipoproteínas' },
    { codigo: 'K21', descripcion: 'Enfermedad del reflujo gastroesofágico' },
    { codigo: 'K29', descripcion: 'Gastritis y duodenitis' },
    { codigo: 'K30', descripcion: 'Dispepsia' },
    { codigo: 'M54', descripcion: 'Dorsalgia' },
    { codigo: 'M17', descripcion: 'Gonartrosis [artrosis de la rodilla]' },
    { codigo: 'N39', descripcion: 'Trastornos del sistema urinario' },
    { codigo: 'R01', descripcion: 'Soplos cardíacos y otros sonidos cardíacos' },
    { codigo: 'R05', descripcion: 'Tos' },
    { codigo: 'R10', descripcion: 'Dolor abdominal y pélvico' },
    { codigo: 'R51', descripcion: 'Cefalea' },
    { codigo: 'Z00', descripcion: 'Examen general e investigación de personas sin quejas' }
  ]
};

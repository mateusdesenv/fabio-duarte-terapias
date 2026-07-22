export const STORAGE_KEY = 'fabio-duarte-terapias-v1'

export const seedData = {
  services: [
    { id: 's1', name: 'Reiki', price: 120, duration: 60, active: true },
    { id: 's2', name: 'Abertura de cartas', price: 150, duration: 60, active: true },
    { id: 's3', name: 'Tarot terapêutico', price: 150, duration: 60, active: true },
    { id: 's4', name: 'Limpeza energética', price: 180, duration: 90, active: true },
    { id: 's5', name: 'Massagem relaxante', price: 160, duration: 60, active: true },
    { id: 's6', name: 'Consulta terapêutica', price: 130, duration: 60, active: true },
  ],
  patients: [
    { id: 'p1', name: 'Mariana Costa', phone: '5551998112233', email: 'mariana@email.com', notes: 'Prefere atendimento no período da manhã.' },
    { id: 'p2', name: 'Lucas Almeida', phone: '5551998223344', email: 'lucas@email.com', notes: 'Primeira consulta realizada em julho.' },
    { id: 'p3', name: 'Ana Ribeiro', phone: '5551998334455', email: 'ana@email.com', notes: 'Enviar confirmação pelo WhatsApp.' },
    { id: 'p4', name: 'Carla Souza', phone: '5551998445566', email: 'carla@email.com', notes: '' },
    { id: 'p5', name: 'Pedro Martins', phone: '5551998556677', email: 'pedro@email.com', notes: 'Atendimento quinzenal.' },
  ],
  appointments: [
    { id: 'a1', patientId: 'p1', serviceId: 's1', date: '2026-07-20', time: '09:00', duration: 60, service: 'Reiki', price: 120, status: 'confirmed', notes: '' },
    { id: 'a2', patientId: 'p2', serviceId: 's2', date: '2026-07-21', time: '10:00', duration: 60, service: 'Abertura de cartas', price: 150, status: 'confirmed', notes: 'Consulta de acompanhamento.' },
    { id: 'a3', patientId: 'p4', serviceId: 's4', date: '2026-07-22', time: '11:00', duration: 90, service: 'Limpeza energética', price: 180, status: 'done', notes: '' },
    { id: 'a4', patientId: 'p3', serviceId: 's5', date: '2026-07-23', time: '15:00', duration: 60, service: 'Massagem relaxante', price: 160, status: 'pending', notes: 'Confirmar duas horas antes.' },
    { id: 'a5', patientId: 'p5', serviceId: 's6', date: '2026-07-24', time: '14:00', duration: 60, service: 'Consulta terapêutica', price: 130, status: 'confirmed', notes: '' },
    { id: 'a6', patientId: 'p1', serviceId: 's1', date: '2026-07-25', time: '10:30', duration: 60, service: 'Reiki', price: 120, status: 'pending', notes: '' },
    { id: 'a7', patientId: 'p2', serviceId: 's3', date: '2026-07-22', time: '16:00', duration: 60, service: 'Tarot terapêutico', price: 150, status: 'canceled', notes: '' },
  ],
}

export const statusMap = {
  confirmed: { label: 'Confirmado', className: 'confirmed' },
  pending: { label: 'A confirmar', className: 'pending' },
  done: { label: 'Realizado', className: 'done' },
  canceled: { label: 'Cancelado', className: 'canceled' },
}

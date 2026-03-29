export enum TaskStatus {
  IN_PROGRESS_AI = 'in-progress-ai', // cliente sendo atendido por automação
  IN_PROGRESS_USER = 'in-progress-user', // cliente sendo atendido por funcionário
  FINISHED = 'finished', // atendimento finalizado
  WAITING_CUSTOMER_RESPONSE = 'waiting-customer-response',
  WAITING_USER_RESPONSE = 'waiting-user-response', // aguardando resposta do funcionário
}

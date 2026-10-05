import React, { useState } from 'react';
import { useStore } from '../../data/store';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Plus, X, User, Calendar, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { clients, tasks, addTask, updateTaskStatus } = useStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [clientId, setClientId] = useState('');
  const [contractId, setContractId] = useState('');

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'A Fazer', color: 'info' },
    { id: 'doing', label: 'Em Andamento', color: 'warning' },
    { id: 'review', label: 'Revisão', color: 'purple' },
    { id: 'done', label: 'Concluído', color: 'success' }
  ];

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignee || !dueDate) return;

    addTask({
      title,
      description,
      dueDate,
      priority,
      status: 'todo',
      assignee,
      clientId: clientId || undefined,
      contractId: contractId || undefined
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setAssignee('');
    setClientId('');
    setContractId('');
    setIsAddOpen(false);
  };

  const getPriorityBadge = (pri: TaskPriority) => {
    switch (pri) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-info';
      case 'high': return 'badge-warning';
      case 'urgent': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
    todo: 'doing',
    doing: 'review',
    review: 'done',
    done: null
  };

  return (
    <div className="tasks-container">
      <div className="section-header flex justify-between items-center mb-2">
        <div>
          <h2>Demandas & Tarefas Operacionais</h2>
          <p className="text-secondary text-sm">Gerencie o fluxo de trabalho e rotinas de atendimento aos clientes da Franco.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Nova Demanda
        </button>
      </div>

      <div className="kanban-board grid-cols-4 gap-2">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="kanban-col glass-card">
              <div className="kanban-col-header flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className={`status-dot ${col.color}`} />
                  <span className="font-semibold">{col.label}</span>
                </div>
                <span className="badge badge-sm">{colTasks.length}</span>
              </div>

              <div className="kanban-cards-list flex flex-col gap-2">
                {colTasks.map(task => {
                  const client = clients.find(c => c.id === task.clientId);
                  const nextStatus = nextStatusMap[task.status];
                  return (
                    <div 
                      key={task.id} 
                      className="kanban-card cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="card-top flex justify-between items-start mb-1">
                        <span className="card-title font-medium text-sm">{task.title}</span>
                        <span className={`badge badge-sm ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="card-desc text-xs text-muted line-clamp-2 mb-2">{task.description}</p>
                      )}
                      <div className="card-footer flex justify-between items-center text-xs text-muted mt-2">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {task.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {task.dueDate}
                        </span>
                      </div>
                      {client && (
                        <div className="client-tag text-xs text-accent mt-1">
                          • {client.name}
                        </div>
                      )}
                      {nextStatus && (
                        <div className="card-actions mt-2 pt-2 border-t border-glass flex justify-end">
                          <button 
                            className="btn btn-xs btn-ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, nextStatus);
                            }}
                          >
                            Avançar <ChevronRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center mb-2">
              <h3>Criar Nova Demanda</h3>
              <button className="icon-btn" onClick={() => setIsAddOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddTaskSubmit}>
              <div className="form-group mb-2">
                <label>Título da Demanda *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group mb-2">
                <label>Descrição</label>
                <textarea 
                  className="input-field" 
                  rows={3} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>
              <div className="grid-cols-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Data de Vencimento *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Prioridade</label>
                  <select 
                    className="input-field" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid-cols-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Responsável *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={assignee} 
                    onChange={e => setAssignee(e.target.value)} 
                    required 
                    placeholder="Nome do operador"
                  />
                </div>
                <div className="form-group">
                  <label>Cliente Vinculado</label>
                  <select 
                    className="input-field" 
                    value={clientId} 
                    onChange={e => setClientId(e.target.value)}
                  >
                    <option value="">Sem cliente vinculado</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions flex justify-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Demanda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center mb-2">
              <h3>Detalhes da Demanda</h3>
              <button className="icon-btn" onClick={() => setSelectedTask(null)}><X size={18} /></button>
            </div>
            <div className="task-detail-body">
              <h4 className="font-semibold text-lg mb-1">{selectedTask.title}</h4>
              <p className="text-secondary text-sm mb-3">{selectedTask.description || 'Sem descrição.'}</p>
              <div className="grid-cols-2 gap-2 text-sm mb-3">
                <div><strong>Status:</strong> <span className="badge badge-sm">{selectedTask.status}</span></div>
                <div><strong>Prioridade:</strong> <span className={`badge badge-sm ${getPriorityBadge(selectedTask.priority)}`}>{selectedTask.priority}</span></div>
                <div><strong>Prazo:</strong> {selectedTask.dueDate}</div>
                <div><strong>Responsável:</strong> {selectedTask.assignee}</div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-glass">
                <div className="flex gap-1">
                  {columns.map(col => (
                    <button 
                      key={col.id} 
                      className={`btn btn-xs ${selectedTask.status === col.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, col.id);
                        setSelectedTask({ ...selectedTask, status: col.id });
                      }}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Plus, 
  Trash2, 
  FileText,
  Search,
  ArrowLeft,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

export function PetitionModelsPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [models, setModels] = useState([]);
  const [theses, setTheses] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [links, setLinks] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModelDialogOpen, setIsCreateModelDialogOpen] = useState(false);
  const [_isEditModelDialogOpen, _setIsEditModelDialogOpen] = useState(false);
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false);
  const [modelFormData, setModelFormData] = useState({ name: '', description: '' });
  const [questionFormData, setQuestionFormData] = useState({ text: '', order: 1, hierarchy_level: 1 });
  const [linkFormData, setLinkFormData] = useState({ question_id: '', thesis_id: '', answer: 'sim' });

  useEffect(() => {
    fetchClient();
    fetchModels();
    fetchTheses();
  }, [clientId]);

  useEffect(() => {
    if (selectedModel) {
      fetchQuestions(selectedModel.id);
    }
  }, [selectedModel]);

  const fetchClient = async () => {
    try {
      // Dados mockados
      setClient({
        id: parseInt(clientId),
        name: 'Banco ABC',
        description: 'Instituição financeira - casos trabalhistas'
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente', error);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      // Dados mockados
      setModels([
        {
          id: 1,
          name: 'Defesa Trabalhista',
          description: 'Modelo para defesas em processos trabalhistas',
          created_at: '2025-01-01T10:00:00Z',
          questions_count: 5
        },
        {
          id: 2,
          name: 'Recurso Ordinário',
          description: 'Modelo para recursos ordinários',
          created_at: '2025-01-02T14:30:00Z',
          questions_count: 3
        }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar modelos', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTheses = async () => {
    try {
      // Dados mockados
      setTheses([
        { id: 1, title: 'Horas extras Netcursos' },
        { id: 2, title: 'Indenização por dano material (celular próprio)' },
        { id: 3, title: 'Adicional de insalubridade' }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar teses', error);
    }
  };

  const fetchQuestions = async (modelId) => {
    try {
      // Dados mockados
      setQuestions([
        {
          id: 1,
          petition_model_id: modelId,
          text: 'O reclamante faz jus a horas extras?',
          order: 1,
          hierarchy_level: 1
        },
        {
          id: 2,
          petition_model_id: modelId,
          text: 'Houve uso de equipamento pessoal?',
          order: 2,
          hierarchy_level: 1
        },
        {
          id: 3,
          petition_model_id: modelId,
          text: 'O ambiente de trabalho é insalubre?',
          order: 3,
          hierarchy_level: 1
        }
      ]);

      // Dados mockados para links
      setLinks([
        { id: 1, question_id: 1, thesis_id: 1, answer: 'sim' },
        { id: 2, question_id: 2, thesis_id: 2, answer: 'sim' },
        { id: 3, question_id: 3, thesis_id: 3, answer: 'sim' }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar perguntas', error);
    }
  };

  const handleCreateModel = async () => {
    try {
      if (!modelFormData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      const newModel = {
        id: Date.now(),
        ...modelFormData,
        created_at: new Date().toISOString(),
        questions_count: 0
      };

      setModels([...models, newModel]);
      setModelFormData({ name: '', description: '' });
      setIsCreateModelDialogOpen(false);
      toast.success('Modelo criado com sucesso');
    } catch (error) {
      toast.error('Erro ao criar modelo', error);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      if (!questionFormData.text.trim()) {
        toast.error('Texto da pergunta é obrigatório');
        return;
      }

      const newQuestion = {
        id: Date.now(),
        petition_model_id: selectedModel.id,
        ...questionFormData
      };

      setQuestions([...questions, newQuestion]);
      setQuestionFormData({ text: '', order: questions.length + 1, hierarchy_level: 1 });
      setIsCreateQuestionDialogOpen(false);
      toast.success('Pergunta criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar pergunta', error);
    }
  };

  const handleCreateLink = async () => {
    try {
      if (!linkFormData.question_id || !linkFormData.thesis_id) {
        toast.error('Pergunta e tese são obrigatórias');
        return;
      }

      const newLink = {
        id: Date.now(),
        ...linkFormData,
        question_id: parseInt(linkFormData.question_id),
        thesis_id: parseInt(linkFormData.thesis_id)
      };

      setLinks([...links, newLink]);
      setLinkFormData({ question_id: '', thesis_id: '', answer: 'sim' });
      setIsCreateLinkDialogOpen(false);
      toast.success('Vinculação criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar vinculação', error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      if (!confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
        return;
      }

      setModels(models.filter(model => model.id !== modelId));
      if (selectedModel?.id === modelId) {
        setSelectedModel(null);
        setQuestions([]);
        setLinks([]);
      }
      toast.success('Modelo excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir modelo', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
        return;
      }

      setQuestions(questions.filter(q => q.id !== questionId));
      setLinks(links.filter(l => l.question_id !== questionId));
      toast.success('Pergunta excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir pergunta', error);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      setLinks(links.filter(l => l.id !== linkId));
      toast.success('Vinculação removida com sucesso');
    } catch (error) {
      toast.error('Erro ao remover vinculação', error);
    }
  };

  const getQuestionText = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.text : 'Pergunta não encontrada';
  };

  const getThesisTitle = (thesisId) => {
    const thesis = theses.find(t => t.id === thesisId);
    return thesis ? thesis.title : 'Tese não encontrada';
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modelos de Petição - {client?.name}</h1>
            <p className="mt-2 text-gray-600">
              Gerencie modelos de petição e suas perguntas para {client?.name}
            </p>
          </div>
        </div>
        <Dialog open={isCreateModelDialogOpen} onOpenChange={setIsCreateModelDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Modelo</DialogTitle>
              <DialogDescription>
                Adicione um novo modelo de petição para {client?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-name">Nome *</Label>
                <Input
                  id="model-name"
                  placeholder="Nome do modelo"
                  value={modelFormData.name}
                  onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="model-description">Descrição</Label>
                <Textarea
                  id="model-description"
                  placeholder="Descrição do modelo"
                  value={modelFormData.description}
                  onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModelDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateModel}>
                Criar Modelo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de modelos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Modelos ({filteredModels.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar modelos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel?.id === model.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{model.name}</h4>
                      <p className="text-sm text-gray-500">{model.questions_count} perguntas</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModel(model.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredModels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum modelo encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do modelo selecionado */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedModel.name}</CardTitle>
                <CardDescription>{selectedModel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="questions">Perguntas</TabsTrigger>
                    <TabsTrigger value="links">Vinculações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="questions" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Perguntas ({questions.length})</h3>
                      <Dialog open={isCreateQuestionDialogOpen} onOpenChange={setIsCreateQuestionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Pergunta
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Criar Nova Pergunta</DialogTitle>
                            <DialogDescription>
                              Adicione uma nova pergunta ao modelo {selectedModel.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="question-text">Texto da Pergunta *</Label>
                              <Textarea
                                id="question-text"
                                placeholder="Ex: O reclamante faz jus a horas extras?"
                                value={questionFormData.text}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, text: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="question-order">Ordem</Label>
                                <Input
                                  id="question-order"
                                  type="number"
                                  min="1"
                                  value={questionFormData.order}
                                  onChange={(e) => setQuestionFormData({ ...questionFormData, order: parseInt(e.target.value) })}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="question-hierarchy">Nível Hierárquico</Label>
                                <Input
                                  id="question-hierarchy"
                                  type="number"
                                  min="1"
                                  value={questionFormData.hierarchy_level}
                                  onChange={(e) => setQuestionFormData({ ...questionFormData, hierarchy_level: parseInt(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateQuestionDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleCreateQuestion}>
                              Criar Pergunta
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {questions.map((question) => (
                        <div key={question.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-500">
                                  #{question.order}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  Nível {question.hierarchy_level}
                                </span>
                              </div>
                              <p className="text-sm">{question.text}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {questions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Nenhuma pergunta cadastrada</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setIsCreateQuestionDialogOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar primeira pergunta
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="links" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Vinculações ({links.length})</h3>
                      <Dialog open={isCreateLinkDialogOpen} onOpenChange={setIsCreateLinkDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" disabled={questions.length === 0}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Vinculação
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Criar Nova Vinculação</DialogTitle>
                            <DialogDescription>
                              Vincule uma tese a uma resposta específica de uma pergunta
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="link-question">Pergunta *</Label>
                              <Select
                                value={linkFormData.question_id}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, question_id: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma pergunta" />
                                </SelectTrigger>
                                <SelectContent>
                                  {questions.map((question) => (
                                    <SelectItem key={question.id} value={question.id.toString()}>
                                      #{question.order} - {question.text}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="link-thesis">Tese *</Label>
                              <Select
                                value={linkFormData.thesis_id}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, thesis_id: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma tese" />
                                </SelectTrigger>
                                <SelectContent>
                                  {theses.map((thesis) => (
                                    <SelectItem key={thesis.id} value={thesis.id.toString()}>
                                      {thesis.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="link-answer">Resposta *</Label>
                              <Select
                                value={linkFormData.answer}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, answer: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sim">Sim</SelectItem>
                                  <SelectItem value="nao">Não</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateLinkDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleCreateLink}>
                              Criar Vinculação
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {links.map((link) => (
                        <div key={link.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  Resposta: {link.answer === 'sim' ? 'Sim' : 'Não'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Pergunta:</strong> {getQuestionText(link.question_id)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Tese:</strong> {getThesisTitle(link.thesis_id)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLink(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {links.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Nenhuma vinculação cadastrada</p>
                          {questions.length > 0 && (
                            <Button 
                              className="mt-4"
                              onClick={() => setIsCreateLinkDialogOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Criar primeira vinculação
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione um modelo para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


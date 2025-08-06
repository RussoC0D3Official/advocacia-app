import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Progress } from '../components/ui/progress';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function GeneratePetitionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Seleção, 2: Formulário, 3: Geração
  const [clients, setClients] = useState([]);
  const [models, setModels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    answers: {}
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPetition, setGeneratedPetition] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchModels(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedModel) {
      fetchQuestions(selectedModel);
    }
  }, [selectedModel]);

  const fetchClients = async () => {
    try {
      // Dados mockados
      setClients([
        { id: 1, name: 'Banco ABC' },
        { id: 2, name: 'INSS' },
        { id: 3, name: 'Empresa XYZ' }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    }
  };

  const fetchModels = async (clientId) => {
    try {
      // Dados mockados
      setModels([
        { id: 1, name: 'Defesa Trabalhista', description: 'Modelo para defesas em processos trabalhistas' },
        { id: 2, name: 'Recurso Ordinário', description: 'Modelo para recursos ordinários' }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar modelos');
    }
  };

  const fetchQuestions = async (modelId) => {
    try {
      // Dados mockados
      setQuestions([
        {
          id: 1,
          text: 'O reclamante faz jus a horas extras?',
          order: 1,
          hierarchy_level: 1
        },
        {
          id: 2,
          text: 'Houve uso de equipamento pessoal?',
          order: 2,
          hierarchy_level: 1
        },
        {
          id: 3,
          text: 'O ambiente de trabalho é insalubre?',
          order: 3,
          hierarchy_level: 1
        }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar perguntas');
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedClient || !selectedModel) {
        toast.error('Selecione um cliente e um modelo');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }
      
      // Verificar se todas as perguntas foram respondidas
      const unansweredQuestions = questions.filter(q => !formData.answers[q.id]);
      if (unansweredQuestions.length > 0) {
        toast.error('Responda todas as perguntas antes de continuar');
        return;
      }
      
      setStep(3);
      generatePetition();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setFormData({
      ...formData,
      answers: {
        ...formData.answers,
        [questionId]: answer
      }
    });
  };

  const generatePetition = async () => {
    try {
      setGenerating(true);
      
      // Simular geração da petição
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const petition = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        client_id: parseInt(selectedClient),
        petition_model_id: parseInt(selectedModel),
        answers: formData.answers,
        content: `# ${formData.title}

## Dados do Processo
- Cliente: ${clients.find(c => c.id === parseInt(selectedClient))?.name}
- Modelo: ${models.find(m => m.id === parseInt(selectedModel))?.name}

## Respostas do Formulário
${questions.map(q => `- ${q.text}: ${formData.answers[q.id] === 'sim' ? 'Sim' : 'Não'}`).join('\n')}

## Conteúdo da Petição
[Conteúdo gerado automaticamente baseado nas respostas e teses vinculadas]

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Fundamentação Legal
Com base nas teses selecionadas e na jurisprudência aplicável, requer-se:

1. O deferimento do pedido principal
2. A condenação da parte contrária
3. A aplicação das penalidades cabíveis

Termos em que pede deferimento.

[Cidade], [Data]

[Nome do Advogado]
OAB/[Estado] [Número]`,
        created_at: new Date().toISOString(),
        status: 'draft'
      };
      
      setGeneratedPetition(petition);
      toast.success('Petição gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar petição');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePetition = async () => {
    try {
      // Aqui você salvaria a petição no backend
      // await api.post('/api/petitions', generatedPetition);
      
      toast.success('Petição salva com sucesso!');
      navigate('/my-petitions');
    } catch (error) {
      toast.error('Erro ao salvar petição');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Seleção de Cliente e Modelo';
      case 2:
        return 'Preenchimento do Formulário';
      case 3:
        return 'Geração da Petição';
      default:
        return '';
    }
  };

  const getProgress = () => {
    return (step / 3) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerar Nova Petição</h1>
        <p className="mt-2 text-gray-600">
          Crie uma petição jurídica a partir de um formulário estruturado
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{getStepTitle()}</CardTitle>
            <span className="text-sm text-gray-500">Etapa {step} de 3</span>
          </div>
          <Progress value={getProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step 1: Seleção */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Cliente</CardTitle>
              <CardDescription>
                Escolha o cliente para o qual a petição será gerada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selecionar Modelo</CardTitle>
              <CardDescription>
                Escolha o modelo de petição a ser utilizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
                disabled={!selectedClient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Formulário */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Petição *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Defesa Trabalhista - João Silva"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição adicional sobre a petição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questionário</CardTitle>
              <CardDescription>
                Responda as perguntas para personalizar a petição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {question.order}. {question.text}
                  </Label>
                  <RadioGroup
                    value={formData.answers[question.id] || ''}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id={`${question.id}-sim`} />
                      <Label htmlFor={`${question.id}-sim`}>Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id={`${question.id}-nao`} />
                      <Label htmlFor={`${question.id}-nao`}>Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Geração */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Geração da Petição</CardTitle>
            <CardDescription>
              {generating ? 'Gerando petição...' : 'Petição gerada com sucesso!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-lg font-medium">Processando suas respostas...</p>
                <p className="text-sm text-gray-500">
                  Estamos mesclando as teses apropriadas com base em suas respostas
                </p>
              </div>
            ) : generatedPetition ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Petição gerada com sucesso!</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Resumo da Petição:</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Título:</strong> {generatedPetition.title}</li>
                    <li><strong>Cliente:</strong> {clients.find(c => c.id === generatedPetition.client_id)?.name}</li>
                    <li><strong>Modelo:</strong> {models.find(m => m.id === generatedPetition.petition_model_id)?.name}</li>
                    <li><strong>Respostas:</strong> {Object.keys(generatedPetition.answers).length} perguntas respondidas</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-3">Prévia do Conteúdo:</h4>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{generatedPetition.content}</pre>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button onClick={handleSavePetition} className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Salvar Petição
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar e Editar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Erro na geração da petição</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {step < 3 && !generating && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <Button onClick={handleNextStep}>
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}


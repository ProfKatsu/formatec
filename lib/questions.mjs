export const quizzes = {
 tecnologia: [
  {text:'Por onde o professor deve acessar a Alura, segundo a formação?',options:['Por uma conta compartilhada de anos iniciais.','Pela Sala do Futuro.','Somente pelo Google Colab.','Pelo BI de Robótica.'],answer:1,explanation:'O material orienta acessar sempre pela Sala do Futuro e não usar o usuário anos_iniciais (páginas 7 e 8).'},
  {text:'Como decidir entre videoaula e Material Digital em cada aula?',options:['Usar apenas vídeos em todas as aulas.','Escolher sem consultar o planejamento.','Consultar o formato indicado no escopo-sequência.','Substituir todos os materiais por exercícios livres.'],answer:2,explanation:'O escopo-sequência indica o formato de aula: Material Digital ou vídeo (página 10).'},
  {text:'Qual indicador é destacado para o BI Alura em 2026?',options:['Média das avaliações mensais.','Somente quantidade de acessos.','Número de contas criadas.','Tempo de conexão ao Wi-Fi.'],answer:0,explanation:'O material destaca a média das avaliações mensais e recomenda conferir filtros, data e hora da análise (páginas 19 a 21).'},
  {text:'Qual orientação sobre a avaliação Alura aparece no material?',options:['Sair da aba é necessário para salvar.','A resposta dissertativa deve ficar em branco.','Copiar e colar é o método recomendado.','Permanecer na aba da avaliação e observar as regras do sistema anticola.'],answer:3,explanation:'Sair da aba gera alertas e pode levar ao envio automático, sem nova chance. A resposta dissertativa exige pelo menos 30 caracteres (páginas 22 a 26).'},
  {text:'No exercício em Python, qual expressão calcula a média de três notas numéricas a, b e c?',options:['a + b + c / 3','(a + b + c) / 3','a * b * c','(a + b + c) * 3'],answer:1,explanation:'Somam-se as três notas antes da divisão por 3. Os exemplos usam float(input(...)) e condicionais if/else (páginas 38 a 43).'}
 ],
 robotica: [
  {text:'Como devem ser publicadas as tarefas de Robótica?',options:['Automaticamente, sem ação do professor.','Apenas no fim do semestre.','Manualmente, antes ou durante a aula, sem prazo de término.','Somente após a competição.'],answer:2,explanation:'O professor publica manualmente e consulta o escopo-sequência, pois nem toda aula tem tarefa vinculada (página 8).'},
  {text:'Onde localizar os modelos de tarefas?',options:['Sala do Futuro > Gerenciador de Atividades > Atividades > Modelos.','Apenas no Google Colab.','No histórico do navegador.','Na área de notas do Python.'],answer:0,explanation:'Em Modelos, use Buscar por > Localizador e selecione a tarefa correspondente à aula (página 9).'},
  {text:'Qual deve ser o papel do professor na batalha de robôs?',options:['Construir o robô no lugar dos estudantes.','Definir o vencedor antes dos testes.','Atuar somente como espectador.','Organizar, mediar, orientar e garantir as regras.'],answer:3,explanation:'O aluno constrói; o professor cria condições para aprender, atuando como organizador, mediador, juiz e orientador (página 14).'},
  {text:'Qual regra de construção e montagem está correta?',options:['Altura livre e balão protegido.','Altura máxima de 15 cm a partir do solo e balão visível e desprotegido sobre o carrinho.','Balão escondido sob o carrinho.','É permitido alterar o robô durante o combate.'],answer:1,explanation:'A altura máxima é 15 cm do solo ao ponto mais alto da estrutura. O balão fica sobre o carrinho, exposto e sem proteção (páginas 16, 18 e 19).'},
  {text:'Como os dois micro:bits se comunicam na proposta?',options:['O controle aciona os motores sem enviar comandos.','Os dois funcionam apenas como cronômetros.','O controle envia comandos por rádio; o carrinho recebe e aciona os motores.','O carrinho dispensa programação.'],answer:2,explanation:'O controle lê botões ou gestos e transmite pelo rádio. O carrinho recebe o comando e aciona os motores conforme o programa (página 23).'}
 ]
};
export function grade(course,answers){
 const q=quizzes[course];
 if(!q || !Array.isArray(answers) || answers.length!==5 || answers.some(a=>!Number.isInteger(a)||a<0||a>3)) throw new Error('Responda às cinco questões.');
 return {score:q.reduce((s,item,i)=>s+Number(item.answer===answers[i]),0),feedback:q.map((item,i)=>({correct:item.answer===answers[i],answer:item.answer,explanation:item.explanation}))};
}
export function publicQuestions(course){return quizzes[course]?.map(({text,options})=>({text,options}));}


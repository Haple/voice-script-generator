
# 🎭 Gerador de Roteiros com Voz

Uma aplicação web moderna para criar roteiros com múltiplos atores e vozes. Perfeito para narração de histórias, escrita de diálogos, narrações e interações de personagens animados.

## ✨ Funcionalidades

- 🎬 Crie roteiros com múltiplos atores
- 🗣️ Gere narrações realistas usando vozes de IA da ElevenLabs
- 👥 Personalize atores com nomes, avatares de emoji e vozes
- 🎵 Reproduza linhas individuais ou o roteiro inteiro em sequência
- ✏️ Edite e regenere linhas específicas a qualquer momento
- 🔄 Interface de arrastar e soltar para reorganizar as linhas de diálogo

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- Uma conta [ElevenLabs](https://elevenlabs.io/) com chave de API

### Instruções de Configuração

1. **Clone o repositório**

   ```bash
   git clone https://github.com/yourusername/voice-script-generator.git
   cd voice-script-generator
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure sua chave de API da ElevenLabs**

   Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

   ```
   ELEVENLABS_API_KEY=sua_chave_api_elevenlabs_aqui
   ```

4. **Execute o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

5. **Abra seu navegador**

   Acesse [http://localhost:3000](http://localhost:3000) para usar a aplicação

## 🔑 Chave API e Vozes

Este projeto usa ElevenLabs para geração de voz. Você precisará de:

- **Chave API**: Registre-se em [ElevenLabs](https://elevenlabs.io/) para obter sua chave API
- **Acesso às Vozes**: As vozes padrão (`qNkzaJoHLLdpvgh5tISm` e `eVItLK1UvXctxuaRV2Oq`) são vozes premium que requerem uma assinatura de plano **Starter** ou **Creator**

### Adicionando Vozes Personalizadas

Você pode adicionar mais vozes editando o array `AVAILABLE_VOICES` em `pages/index.tsx`:

```typescript
const AVAILABLE_VOICES = [
  { id: "qNkzaJoHLLdpvgh5tISm", name: "Voz Masculina", gender: "male" },
  { id: "eVItLK1UvXctxuaRV2Oq", name: "Voz Feminina", gender: "female" },
  // Adicione seus IDs de voz aqui:
  // { id: "SEU_ID_DE_VOZ_AQUI", name: "Voz Personalizada", gender: "male" },
];
```

## 🔧 Detalhes de Implementação

A aplicação é construída com:

- **Next.js** como framework React
- **TypeScript** para segurança de tipos
- **React Beautiful DND** para funcionalidade de arrastar e soltar
- **API ElevenLabs** para geração de voz com IA

## 📝 Estrutura do Projeto

- `/pages` - Páginas Next.js e rotas de API
- `/styles` - Módulos CSS para estilização
- `/lib` - Funções utilitárias e bibliotecas
- `/public` - Recursos estáticos

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- [ElevenLabs](https://elevenlabs.io/) pela tecnologia de voz com IA
- [Next.js](https://nextjs.org/) pelo framework React
- [React Beautiful DND](https://github.com/atlassian/react-beautiful-dnd) pela funcionalidade de arrastar e soltar

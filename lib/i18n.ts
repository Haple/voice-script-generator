
import { NextRouter } from 'next/router';

export type Language = 'en' | 'pt-BR';

export const DEFAULT_LANGUAGE: Language = 'en';

// Get language from router query parameter
export function getLanguage(router: NextRouter): Language {
  const { lang } = router.query;
  if (lang === 'pt-BR') {
    return 'pt-BR';
  }
  return DEFAULT_LANGUAGE;
}

// Load translations for the given language
export function loadTranslations(language: Language) {
  return translations[language] || translations[DEFAULT_LANGUAGE];
}

// Type for translations
export type Translations = {
  title: string;
  subtitle: string;
  emptyScript: string;
  startWriting: string;
  generateVoices: string;
  actors: {
    title: string;
    addActor: string;
    editActor: string;
    name: string;
    emoji: string;
    voice: string;
    preview: string;
    save: string;
    delete: string;
  };
  dialog: {
    enterDialogue: string;
    play: string;
    generate: string;
    regenerate: string;
    delete: string;
  };
};

// Translations object
const translations: Record<Language, Translations> = {
  'en': {
    title: 'Script Generator',
    subtitle: 'Bring your dialogue to life',
    emptyScript: 'Your script is empty. Add some lines to get started!',
    startWriting: 'Start Writing',
    generateVoices: 'Generate Voices',
    actors: {
      title: 'Your Actors',
      addActor: 'Add New Actor',
      editActor: 'Edit Actor',
      name: 'Name:',
      emoji: 'Emoji:',
      voice: 'Voice:',
      preview: 'Preview',
      save: 'Save',
      delete: 'Delete'
    },
    dialog: {
      enterDialogue: 'Enter dialogue...',
      play: 'Play',
      generate: 'Generate',
      regenerate: 'Regenerate',
      delete: 'Delete'
    }
  },
  'pt-BR': {
    title: 'Gerador de Roteiro',
    subtitle: 'Dê vida ao seu diálogo',
    emptyScript: 'Seu roteiro está vazio. Adicione algumas linhas para começar!',
    startWriting: 'Começar a Escrever',
    generateVoices: 'Gerar Vozes',
    actors: {
      title: 'Seus Atores',
      addActor: 'Adicionar Novo Ator',
      editActor: 'Editar Ator',
      name: 'Nome:',
      emoji: 'Emoji:',
      voice: 'Voz:',
      preview: 'Prévia',
      save: 'Salvar',
      delete: 'Excluir'
    },
    dialog: {
      enterDialogue: 'Digite o diálogo...',
      play: 'Reproduzir',
      generate: 'Gerar',
      regenerate: 'Regenerar',
      delete: 'Excluir'
    }
  }
};

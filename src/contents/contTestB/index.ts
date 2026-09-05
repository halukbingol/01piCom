import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './TestB-board';
import configText from './config.txt';
import codeText from './TestB-code.java';
import highlightText from './TestB-highlight.txt';
import descriptionText from './TestB-desc.html';
import traceText from './TestB-trace.txt';

/**
 * The compiled `contTestB` content: a direct-access memory visualization of the
 * Java fragment `int a = 7; int b = 5; a = b;`.
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'contTestB',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};

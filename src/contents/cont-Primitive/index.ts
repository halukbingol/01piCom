import { steps, resetBoard } from './Primitive-board';
import configText from './config.txt';
import codeText from './Primitive-code.java';
import highlightText from './Primitive-highlight.txt';
import descriptionText from './Primitive-desc.html';
import traceText from './Primitive-trace.txt';

import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';


/**
 * The compiled `cont-Primitive` content: a direct-access memory visualization
 * of primitive variable declaration and assignment in Java.
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'cont-Primitive',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};

import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './board';
import configText from './config.txt';
import codeText from './Arrays-code.java';
import highlightText from './Arrays-highlight.txt';
import descriptionText from './Arrays-desc.html';
import traceText from './Arrays-trace.txt';

/**
 * The compiled `content-Arrays` content: a direct-access visualization of Java
 * array creation, element assignment, and reading elements back
 * (`int[] nums = new int[5]; ... int sum = nums[0] + nums[1];`).
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'content-Arrays',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};

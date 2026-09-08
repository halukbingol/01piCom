import { steps, resetBoard } from './PrimitiveTypes-board';
import configText from './config.txt';
import codeText from './PrimitiveTypes-code.java';
import highlightText from './PrimitiveTypes-highlight.txt';
import descriptionText from './PrimitiveTypes-desc.html';
import traceText from './PrimitiveTypes-trace.txt';
import downloadText from './PrimitiveTypes-download.txt';

import {
  parseConfig,
  parseDownloadManifest,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';


/**
 * The compiled `PrimitiveTypes` content: a direct-access memory visualization
 * of primitive variable declaration and assignment in Java.
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'PrimitiveTypes',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
  downloads: parseDownloadManifest(downloadText),
};

import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './CodeEditor.css';

/**
 * CodeEditor Component
 * 
 * A full-featured code editor using Monaco Editor (same as VS Code)
 * Supports syntax highlighting, IntelliSense, and more
 */
const CodeEditor = ({ file }) => {
  const editorRef = useRef(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // Debug logging to see exactly what we're receiving
  useEffect(() => {
    console.log('CodeEditor received file:', file);
  }, [file]);

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Register Solidity language if it doesn't exist
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'sol')) {
      monaco.languages.register({ id: 'sol' });
      
      // Basic Solidity syntax highlighting
      monaco.languages.setMonarchTokensProvider('sol', {
        tokenizer: {
          root: [
            [/pragma solidity/, 'keyword'],
            [/contract|interface|library|function|event|modifier|struct|enum/, 'keyword'],
            [/public|private|internal|external|pure|view|payable/, 'keyword'],
            [/uint|int|bool|address|string|bytes/, 'type'],
            [/mapping|memory|storage|calldata/, 'keyword'],
            [/constructor|require|assert|revert/, 'keyword'],
            [/[0-9]+/, 'number'],
            [/".*?"/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment']
          ]
        }
      });
    }
  };

  // Handle content change
  const handleEditorChange = (value) => {
    // In a real implementation, this would update the file content
    console.log('Content changed');
  };

  // Determine language from file extension
  const getLanguageFromFileName = (fileName) => {
    if (!fileName) return 'javascript';
    
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      sol: 'solidity',
      txt: 'plaintext'
    };
    
    return languageMap[extension] || 'plaintext';
  };

  // Extract file information based on our understanding of the data structure
  // The file prop is the entire tab object from WorkspaceManager
  const fileName = file?.data?.fileName || 'Untitled';
  const fileContent = file?.data?.content !== undefined ? file.data.content : '// No content available';
  const language = file?.data?.language || getLanguageFromFileName(fileName);

  // Editor options
  const editorOptions = {
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    renderLineHighlight: 'all',
    highlightActiveIndentGuide: true,
    renderIndentGuides: true,
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    quickSuggestions: true,
    quickSuggestionsDelay: 100,
    parameterHints: { enabled: true },
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'mouseover',
    matchBrackets: 'always',
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'always',
      seedSearchStringFromSelection: 'always'
    }
  };

  return (
    <div className="code-editor-container">
      <div className="editor-content">
        <Editor
          height="100%"
          language={language}
          value={fileContent}
          theme={editorTheme}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          loading={<div className="editor-loading">Loading editor...</div>}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
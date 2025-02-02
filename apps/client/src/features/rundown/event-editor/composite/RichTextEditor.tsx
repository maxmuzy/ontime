import { CSSProperties, useCallback, useRef, useState, useEffect } from 'react';
import { Box, Button, HStack, Input } from '@chakra-ui/react';
import * as Editor from '../../../editors/editor-utils/EditorUtils';
import { EditorUpdateFields } from '../EventEditor';

interface RichTextEditorProps {
  className?: string;
  field: EditorUpdateFields;
  label: string;
  initialValue: string;
  style?: CSSProperties;
  submitHandler: (field: EditorUpdateFields, value: string) => void;
}

export default function RichTextEditor(props: RichTextEditorProps) {
  const { className, field, label, initialValue, style: givenStyles, submitHandler } = props;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  // Callback para submeter o valor atual (em HTML)
  const submitCallback = useCallback(() => {
    if (editorRef.current) {
      submitHandler(field, editorRef.current.innerHTML);
    }
  }, [field, submitHandler]);

  // Atualiza o estado sempre que o conteúdo do editor muda
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setValue(editorRef.current.innerHTML);
    }
  }, []);

  // Submete quando Ctrl+Enter for pressionado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        submitCallback();
      }
    },
    [submitCallback]
  );

  // Função para aplicar formatação (negrito, itálico, etc.)
  const applyFormat = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      setValue(editorRef.current.innerHTML);
    }
  };

  // Handler para alterar a cor do texto
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTextColor(color);
    applyFormat('foreColor', color);
  };

  // Handler para alterar a cor de fundo do texto
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBgColor(color);
    // O comando 'hiliteColor' define a cor de fundo do texto selecionado
    applyFormat('hiliteColor', color);
  };

  // Garante que o conteúdo inicial seja definido no editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  return (
    <Box>
      <Editor.Label className={className} htmlFor={field} style={givenStyles}>
        {label}
      </Editor.Label>
      {/* Barra de ferramentas com botões estilizados */}
      <HStack spacing={2} mb={2}>
        <Button
          size="sm"
          bg="#303030"
          color="#f6f6f6"
          border="1px solid transparent"
          borderRadius="3px"
          _hover={{ bg: "#404040" }}
          _active={{ bg: "#2d2d2d", borderColor: "#202020" }}
          variant="solid"
          onClick={() => applyFormat('bold')}
          fontWeight="bold"
          title="Bold"
        >
          B
        </Button>
        <Button
          size="sm"
          bg="#303030"
          color="#f6f6f6"
          border="1px solid transparent"
          borderRadius="3px"
          _hover={{ bg: "#404040" }}
          _active={{ bg: "#2d2d2d", borderColor: "#202020" }}
          variant="solid"
          onClick={() => applyFormat('italic')}
          fontStyle="italic"
          title="Italic"
        >
          I
        </Button>
        <Button
          size="sm"
          bg="#303030"
          color="#f6f6f6"
          border="1px solid transparent"
          borderRadius="3px"
          _hover={{ bg: "#404040" }}
          _active={{ bg: "#2d2d2d", borderColor: "#202020" }}
          variant="solid"
          onClick={() => applyFormat('underline')}
          textDecoration="underline"
          title="Underline"
        >
          U
        </Button>
        <Input
          type="color"
          borderRadius="3px"
          bg="#303030"
          _hover={{ bg: "#404040" }}
          _active={{ bg: "#2d2d2d", borderColor: "#202020" }}
          value={textColor}
          onChange={handleTextColorChange}
          title="Text Color"
          w="28px"
          h="30px"
          p={1}
          border="none"
          cursor="pointer"
        />
        <Input
          type="color"
          borderRadius="3px"
          bg="#303030"
          _hover={{ bg: "#404040" }}
          _active={{ bg: "#2d2d2d", borderColor: "#202020" }}
          value={bgColor}
          onChange={handleBgColorChange}
          title="Background Color"
          w="28px"
          h="30px"
          p={1}
          border="none"
          cursor="pointer"
        />
      </HStack>
      {/* Editor de conteúdo com formatação inline */}
      <Box
        id={field}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={submitCallback}
        onKeyDown={handleKeyDown}
        border="1px solid"
        borderColor="gray.300"
        p={2}
        minH="100px"
        borderRadius="md"
        style={givenStyles}
      />
    </Box>);
}

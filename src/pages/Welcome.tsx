import React, { useState, useMemo, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';
// Import React dependencies.
// Import the Slate editor factory.
import { createEditor } from 'slate';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';

import { BaseEditor, Descendant, Transforms, Editor, Text } from 'slate';
import { Node } from 'slate';

import { ReactEditor } from 'slate-react';

type CustomElement = { type: 'paragraph'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
const initialValue: Descendant[] = [
  {
    type: 'des_stem',
    children: [
      {
        text: '题目：',
      },
    ],
  },
  {
    type: 'des_answer',
    checked: true,
    children: [{ text: '答案：' }],
  },
  {
    type: 'des_analysis',
    checked: true,
    children: [{ text: '解析：' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'stem',
    children: [{ text: 'why you named ding? ' }],
  },
  {
    type: 'answer',
    children: [{ text: '我是答案案我是答案案我是答案案我是答案案' }],
  },
];

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};
const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const Leaf = (props) => {
  console.log('[Leaf props]', props);
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
      {props.children}
    </span>
  );
};

const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    console.log('[isCode]', isActive);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: (n) => Editor.isBlock(editor, n) },
    );
  },

  // addStem(editor) {
  //   Transforms.setNodes(editor, { type: 'stem' });
  // },
  // addAnswer(editor) {
  //   Transforms.setNodes(editor, { type: 'answer' });
  // },
};

// const deserialize = (string) => {
//   return string.split('\n').map((line) => {
//     return {
//       children: [{ text: line }],
//     };
//   });
// };
// const serialize = (value) => {
//   console.log('[sss]', value);
//   return value.map((n) => Node.string(n).join('\n'));
// };

// Define a serializing function that takes a value and returns a string.
const serialize = (value) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join('\n')
  );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (string) => {
  // Return a value array of children derived by splitting the string.
  return string.split('\n').map((line) => {
    return {
      children: [{ text: line }],
    };
  });
};

const AppEditor = () => {
  // const [editor] = useState(() => withReact(createEditor()));
  // const initialValue = useMemo(
  //   () =>
  //     JSON.parse(localStorage.getItem('content')) || [
  //       {
  //         type: 'paragraph',
  //         children: [{ text: 'A line of text in a paragraph.' }],
  //       },
  //     ],
  //   [],
  // );

  // const initialValue = useMemo(
  //   () =>
  //     [
  //       {
  //         type: 'paragraph',
  //         children: [{ text: 'A line of text in a paragraph.' }],
  //       },
  //     ] ||
  //     deserialize(localStorage.getItem('content')) || [
  //       {
  //         type: 'paragraph',
  //         children: [{ text: 'A line of text in a paragraph.' }],
  //       },
  //     ],
  //   [],
  // );
  // const initialValue = useMemo(
  //   () =>
  //     JSON.parse(localStorage.getItem('content')) || [
  //       {
  //         type: 'paragraph',
  //         children: [{ text: 'A line of text in a paragraph.' }],
  //       },
  //     ],
  //   [],
  // );
  // console.log('111', localStorage.getItem('content'));
  // console.log('222', deserialize(localStorage.getItem('content')));

  // // const initialValue = useMemo(deserialize(localStorage.getItem('content')) || '', []);

  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = useCallback((props) => {
    console.log('[props]', props);
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      case 'stem':
        return (
          <div>
            <p>题目</p>
            <a>{props.children}</a>
          </div>
        );
      case 'answer':
        return (
          <div>
            <p>答案</p>
            <a>{props.children}</a>
          </div>
        );
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);
  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        console.log('[editor.operations]', editor.operations, value);
        const isAstChange = editor.operations.some((op) => 'set_selection' !== op.type);
        if (isAstChange) {
          // // Save the value to Local Storage.
          // const content = JSON.stringify(value);
          // localStorage.setItem('content', content);
          localStorage.setItem('content', serialize(value));
        }
      }}
    >
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
        {/* <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.addStem(editor);
          }}
        >
          题目模板
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.addAnswer(editor);
          }}
        >
          da模板
        </button> */}
      </div>
      {/* <Editable /> */}
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (event.key === '&') {
            // Prevent the ampersand character from being inserted.
            event.preventDefault();
            // Execute the `insertText` method when the event occurs.
            editor.insertText('and');
          } else {
            if (!event.ctrlKey) {
              return;
            }
            // Replace the `onKeyDown` logic with our new commands.
            switch (event.key) {
              case '`': {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
                break;
              }

              case 'b': {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
                break;
              }
            }
          }
        }}
      />
    </Slate>
  );
};
const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

const Welcome: React.FC = () => {
  const intl = useIntl();

  return (
    <PageContainer>
      <Card>
        aa
        <AppEditor />
      </Card>
    </PageContainer>
  );
};

export default Welcome;

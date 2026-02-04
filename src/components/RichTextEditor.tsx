'use client';

import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './RichTextEditor.module.css';
import { uploadFile } from '@/lib/storage';
import { compressImage } from '@/lib/imageUtils';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuillDynamic = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        // Using a wrapper function that maps forwardedRef to the actual ref prop
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
        Component.displayName = 'ReactQuillDynamic';
        return Component;
    },
    {
        ssr: false,
        loading: () => <div className={styles.loadingPlaceholder}></div>,
    }
);

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quillRef = useRef<any>(null);

    // Define modules inside useMemo to avoid re-renders and preserve editor state
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, 'blockquote'],
                ['link', 'image', 'code-block'],
                ['clean']
            ],
            handlers: {
                image: function () {
                    const url = window.prompt('Enter the image URL:');
                    if (url) {
                        const quill = (this as any).quill;
                        const range = quill.getSelection();
                        if (quill && range) {
                            quill.insertEmbed(range.index, 'image', url);
                            quill.setSelection(range.index + 1);
                        }
                    }
                }
            }
        },
        clipboard: {
            matchVisual: false,
            // Custom Matcher to intercept large images
            matchers: [
                ['img', (node: any, delta: any) => {
                    // Check if the image source is a data URL (Base64)
                    const src = node.getAttribute('src');
                    if (src && src.startsWith('data:image/')) {
                        // Estimate size. If it's larger than 100KB, block it.
                        // Large images should be uploaded or linked via URL.
                        if (src.length > 100000) {
                            alert('⚠️ IMAGE TOO LARGE: Direct pasting of large images is disabled to prevent data limits. Please use the "Featured Image" URL field or upload/link a smaller image.');
                            return { ops: [] }; // Block insertion
                        }
                    }
                    return delta;
                }]
            ]
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'blockquote',
        'link', 'image', 'code-block'
    ];

    return (
        <div className={styles.editorContainer}>
            <ReactQuillDynamic
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}

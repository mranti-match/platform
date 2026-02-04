import { NextResponse } from 'next/server';
import { createPost } from '@/lib/posts';

const SEED_DATA = [
    {
        title: 'Mastering React Server Components',
        slug: 'mastering-react-server-components',
        excerpt: 'A deep dive into the mental model of server components and how they shift the way we build hybrid applications in 2024.',
        coverImage: 'https://placehold.co/600x400/121212/FFF.png?text=React+Server+Components',
        tags: ['React', 'Performance', 'Architecture'],
        categories: ['Technology', 'React'],
        content: `
      <p>React Server Components (RSC) represent a paradigm shift in how we build React applications. By allowing components to render exclusively on the server, we can reduce the bundle size sent to the client and improve initial page load performance.</p>
      <h2>Why Server Components?</h2>
      <p>Traditionally, React components run on the client. This means all the JavaScript code for the component, plus its dependencies, must be downloaded, parsed, and executed by the browser before the user sees anything interactive.</p>
      <p>With Server Components, we can move that logic to the server. The server renders the component and streams the HTML to the client. This is especially powerful for components that need to access a database or file system directly.</p>
      <h2>The Future of Hybrid Apps</h2>
      <p>RSC isn't about replacing Client Components; it's about using the right tool for the job. Interactive UI elements like buttons and forms will still be Client Components, while data-heavy parts of the page can be Server Components.</p>
    `
    },
    {
        title: 'CSS Container Queries: A New Era',
        slug: 'css-container-queries',
        excerpt: 'Why media queries are becoming legacy, and how container queries allow for truly modular component design systems.',
        coverImage: 'https://placehold.co/600x400/222/FFF.png?text=CSS+Container+Queries',
        tags: ['CSS', 'Design Systems'],
        categories: ['Design', 'Technology'],
        content: `
      <p>Container queries allow us to style elements based on the size of their container rather than the viewport. This makes components truly modular and portable.</p>
      <h2>No More Media Query Hacks</h2>
      <p>We've all been there: creating a card component that looks great in the sidebar but broken in the main content area because the viewport width triggered a different breakpoint. Container queries solve this elegantly.</p>
    `
    },
    {
        title: 'Optimizing Fonts for Web Performance',
        slug: 'optimizing-fonts',
        excerpt: 'Strategies for loading web fonts efficiently to reduce CLS and improve First Contentful Paint scores.',
        coverImage: 'https://placehold.co/600x400/333/FFF.png?text=Web+Fonts',
        tags: ['Web Vitals', 'Typography'],
        categories: ['Performance'],
        content: `<p>Fonts are often the heaviest assets on a webpage. Optimizing them is crucial for Core Web Vitals.</p>`
    },
    {
        title: 'Scalable Node.js Architecture',
        slug: 'scalable-nodejs',
        excerpt: 'Best practices for structuring large-scale Node.js applications with microservices and Docker.',
        coverImage: 'https://placehold.co/600x400/111/FFF.png?text=Node.js',
        tags: ['Node.js', 'Backend'],
        categories: ['Technology', 'Backend'],
        content: `<p>Building scalable systems requires more than just writing clean code. It requires thinking about architecture, deployment, and observability.</p>`
    }
];

export async function GET() {
    try {
        const promises = SEED_DATA.map(post => createPost(post));
        const ids = await Promise.all(promises);

        return NextResponse.json({
            message: 'Database seeded successfully!',
            createdIds: ids
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

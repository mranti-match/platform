import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AnalyticsTracker />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}

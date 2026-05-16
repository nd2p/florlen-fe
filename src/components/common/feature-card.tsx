import { IconBrandCraft } from '@tabler/icons-react';

interface FeatureCardProps {
    icon: string; // Material symbols icon name
    title: string;
    description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
    return (
        <div className="flex items-center gap-4 bg-primary-container/20 p-4 rounded-xl backdrop-blur-md">
            <IconBrandCraft stroke={2} color='white' />
            <div>
                <p className="text-on-primary font-headline font-bold">{title}</p>
                <p className="text-on-primary text-sm">{description}</p>
            </div>
        </div>
    );
}

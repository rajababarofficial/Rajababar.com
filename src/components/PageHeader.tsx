import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
    return (
        <div className="text-center md:text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center md:items-start gap-4"
            >
                {icon && (
                    <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl shadow-sm mb-4 md:mb-0">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient tracking-tight">
                        {title}
                    </h1>
                    <p className="text-brand-secondary text-lg max-w-2xl">
                        {description}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

import React from 'react';

interface WelcomeProps {
    name: string;
    count?: number; // Optional prop
}

const Welcome: React.FC<WelcomeProps> = ({ name, count = 0 }) => {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>You have {count} new messages.</p>
        </div>
    );
};

export default Welcome;

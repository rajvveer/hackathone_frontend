const Loader = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className={`${sizeClasses[size]} border-white/20 border-t-primary rounded-full animate-spin`}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-50">
                {spinner}
                <p className="text-gray-400 text-sm mt-4">{text}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default Loader;

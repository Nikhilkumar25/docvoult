'use client';

export default function FolderCard({ folder, onClick, onDelete }) {
    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this folder? All documents inside will be moved to the main dashboard.')) {
            onDelete(folder.id);
        }
    };

    return (
        <div
            className="group relative flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium-hover shadow-sm"
            onClick={() => onClick(folder.id)}
        >
            <div className="flex items-center gap-4 min-w-0 pr-4">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-orange-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div className="min-w-0 truncate">
                    <h3 className="m-0 text-base font-semibold text-gray-900 leading-tight truncate">{folder.name}</h3>
                    <p className="m-0 mt-1 text-sm text-gray-500 truncate">
                        {folder._count?.documents || 0} documents
                    </p>
                </div>
            </div>

            <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                title="Delete Folder"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}

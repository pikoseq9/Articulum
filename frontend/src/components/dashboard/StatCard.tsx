import React from 'react';

interface Props {
    readCount: number;
    goal: number;
    percent: number;
    pagesRead: number;
    readingCount: number;
    onClick: () => void;
}

export const StatCard: React.FC<Props> = ({ readCount, goal, percent, pagesRead, readingCount, onClick }) => {
    return (
        <>
            <div className="card progress-card clickable-card" onClick={onClick} title="Kliknij, aby zobaczyć historię">
                <h3>Cel Roczny</h3>
                <div className="progress-stats">
                    <span>{readCount} ukończonych</span>
                    <span className="goal-text">Cel: {goal}</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                </div>
                <p className="subtext">{percent}% celu zrealizowane</p>
            </div>
            <div className="stats-row">
                <div className="card stat-mini"><h4>Strony</h4><p>{pagesRead}</p></div>
                <div className="card stat-mini"><h4>W trakcie</h4><p>{readingCount}</p></div>
            </div>
        </>
    );
};
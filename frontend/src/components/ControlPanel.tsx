// src/components/ControlPanel.tsx
import React from 'react';

type Props = {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onReset: () => void;
    speed: number;
    setSpeed: (speed: number) => void;
    generation: number;
    fitness: number;
};

export const ControlPanel: React.FC<Props> = ({
    isPlaying,
    onTogglePlay,
    onReset,
    speed,
    setSpeed,
    generation,
    fitness,
}) => {
    return (
        <div style={styles.panel}>
            <div style={styles.statsGroup}>
                <div style={styles.statItem}>
                    <span style={styles.label}>Generation:</span>
                    <span style={styles.value}>{generation}</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.label}>Fitness:</span>
                    <span style={styles.value}>{(fitness * 100).toFixed(2)}%</span>
                </div>
            </div>

            <div style={styles.controlsGroup}>
                <button onClick={onTogglePlay} style={styles.button}>
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={onReset} style={styles.buttonSecondary}>
                    ↺ Reset
                </button>
            </div>

            <div style={styles.sliderGroup}>
                <label style={styles.label}>Speed: x{speed}</label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={styles.slider}
                />
            </div>
        </div>
    );
};

const styles = {
    panel: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    statsGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
    },
    label: {
        fontSize: '0.8rem',
        color: '#666',
        marginBottom: '4px',
    },
    value: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#333',
    },
    controlsGroup: {
        display: 'flex',
        gap: '10px',
    },
    button: {
        flex: 2,
        padding: '10px',
        fontSize: '1rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    buttonSecondary: {
        flex: 1,
        padding: '10px',
        fontSize: '1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    sliderGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '5px',
    },
    slider: {
        width: '100%',
        cursor: 'pointer',
    },
};
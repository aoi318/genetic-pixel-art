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
    populationSize: number;
    setPopulationSize: (size: number) => void;
    mutationRate: number;
    setMutationRate: (rate: number) => void;
    isAutoMutation: boolean;
    setIsAutoMutation: (isAuto: boolean) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    isParallel: boolean;
    setIsParallel: (isParallel: boolean) => void;
    fps: number;
};

export const ControlPanel: React.FC<Props> = ({
    isPlaying,
    onTogglePlay,
    onReset,
    speed,
    setSpeed,
    generation,
    fitness,
    populationSize,
    setPopulationSize,
    mutationRate,
    setMutationRate,
    isAutoMutation,
    setIsAutoMutation,
    gridSize,
    setGridSize,
    isParallel,
    setIsParallel,
    fps,
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
            <div style={styles.statItem}>
                <span style={styles.label}>Speed:</span>
                <span style={styles.value}>{fps} FPS</span>
            </div>
            <div style={styles.controlsGroup}>
                <button onClick={onTogglePlay} style={styles.button}>
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={onReset} style={styles.buttonSecondary}>
                    ↺ Reset
                </button>
            </div>

            {/* 並列処理設定 */}
            <div style={styles.sliderGroup}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={isParallel}
                        onChange={(e) => setIsParallel(e.target.checked)}
                    />
                    Enable Parallel Processing (WASM)
                </label>
            </div>

            {/* 速度スライダー */}
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

            <hr style={styles.divider} />

            {/* 人口サイズ（リセットで適用） */}
            <div style={styles.sliderGroup}>
                <label style={styles.label}>Population: {populationSize} (Reset to apply)</label>
                <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={populationSize}
                    onChange={(e) => setPopulationSize(Number(e.target.value))}
                    style={styles.slider}
                />
            </div>

            {/* 変異率設定 */}
            <div style={styles.sliderGroup}>
                <div style={styles.row}>
                    <label style={styles.label}>Mutation Rate: {mutationRate.toFixed(3)}</label>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isAutoMutation}
                            onChange={(e) => setIsAutoMutation(e.target.checked)}
                        />
                        Auto
                    </label>
                </div>

                <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={mutationRate}
                    disabled={isAutoMutation}
                    onChange={(e) => setMutationRate(Number(e.target.value))}
                    style={{ ...styles.slider, opacity: isAutoMutation ? 0.5 : 1 }}
                />
            </div>

            {/* グリッドサイズ設定 */}
            <div>
                <div className="setting-item">
                    <label>Grid Size:</label>
                    <select
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        disabled={isPlaying}
                        style={{ padding: '4px', marginLeft: '8px' }}
                    >
                        <option value="32">32 x 32</option>
                        <option value="64">64 x 64</option>
                        <option value="128">128 x 128</option>
                    </select>
                </div>

                {/* 警告メッセージ (条件付きレンダリング) */}
                {gridSize >= 128 && (
                    <p style={{ color: 'orange', fontSize: '0.9em', marginTop: '4px' }}>
                        ⚠ High resolution mode may slow down performance.
                    </p>
                )}
            </div>
        </div >
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
    select: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #eee',
        width: '100%',
        margin: '0',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: '0.8rem',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
    },
};
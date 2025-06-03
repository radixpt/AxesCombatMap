import React, { useState, useMemo } from 'react';

const X_MIN = -200;
const X_MAX = 0;
const Y_MIN = -200;
const Y_MAX = 0;

export default function GridMapApp() {
  const [points, setPoints] = useState([]);
  const [form, setForm] = useState({
    name: '',
    x: '',
    y: '',
    ally: false,
    enemy: false,
  });
  const [jsonData, setJsonData] = useState('');

  const pointColorMap = useMemo(() => {
    const map = new Map();
    points.forEach(({ x, y, ally, enemy, name }) => {
      const key = `${x},${y}`;
      let color = 'white';
      if (enemy) color = 'red';
      else if (ally) color = 'blue';
      map.set(key, { color, name });
    });
    return map;
  }, [points]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (type === 'checkbox') {
        if (name === 'ally' && checked) {
          return { ...prev, ally: true, enemy: false };
        }
        if (name === 'enemy' && checked) {
          return { ...prev, enemy: true, ally: false };
        }
        return { ...prev, [name]: checked };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const x = parseInt(form.x, 10);
    const y = parseInt(form.y, 10);
    if (
      !form.name.trim() ||
      Number.isNaN(x) ||
      Number.isNaN(y) ||
      x < X_MIN ||
      x > X_MAX ||
      y < Y_MIN ||
      y > Y_MAX
    ) {
      alert('Please provide a valid name and coordinates within range.');
      return;
    }
    setPoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        x,
        y,
        ally: form.ally,
        enemy: form.enemy,
      },
    ]);
    setForm((prev) => ({ ...prev, name: '', x: '', y: '', ally: false, enemy: false }));
  };

  const handleRemove = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const exportJson = () => {
    const line = points
      .map((p) => `${p.name}|${p.x}|${p.y}|${p.ally ? 'A' : p.enemy ? 'E' : 'N'}`)
      .join(',');
    setJsonData(line);
  };

  const importJson = () => {
    try {
      const parsed = jsonData
        .split(',')
        .map((entry) => {
          const [name, x, y, type] = entry.split('|');
          return {
            id: crypto.randomUUID(),
            name,
            x: parseInt(x, 10),
            y: parseInt(y, 10),
            ally: type === 'A',
            enemy: type === 'E',
          };
        });
      setPoints(parsed);
    } catch (e) {
      alert('Error parsing custom JSON format');
    }
  };

  const clearAll = () => {
    setPoints([]);
    setJsonData('');
  };

  const gridRows = useMemo(() => {
    const rows = [];
    for (let y = Y_MAX; y >= Y_MIN; y--) {
      const cells = [];
      for (let x = X_MIN; x <= X_MAX; x++) {
        const key = `${x},${y}`;
        const data = pointColorMap.get(key);
        const color = data?.color || 'white';
        const title = data?.name ? `${data.name} (${x}/${y})` : `${x}/${y}`;
        cells.push(
          <div
            key={key}
            className="w-3 h-3 border border-gray-200"
            style={{ backgroundColor: color }}
            title={title}
          />
        );
      }
      rows.push(cells);
    }
    return rows.flat();
  }, [pointColorMap]);

  return (
    <div className="flex h-screen w-screen font-sans text-sm">
      <div className="w-1/3 min-w-[260px] max-w-md border-r p-4 space-y-4 overflow-y-auto">
        <h1 className="text-xl font-semibold mb-2">Axes Combat Manager</h1>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block">Player</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">X (−200 to 0)</label>
              <input
                type="number"
                name="x"
                value={form.x}
                onChange={handleChange}
                min={X_MIN}
                max={X_MAX}
                className="w-full border rounded p-1"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block">Y (0 to -200)</label>
              <input
                type="number"
                name="y"
                value={form.y}
                onChange={handleChange}
                min={Y_MIN}
                max={Y_MAX}
                className="w-full border rounded p-1"
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="ally"
                checked={form.ally}
                onChange={handleChange}
              />
              Ally
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="enemy"
                checked={form.enemy}
                onChange={handleChange}
              />
              Enemy
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Point
          </button>
        </form>

        <h2 className="font-medium mt-4 mb-1">Current Points</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-1 border">Player</th>
              <th className="p-1 border">X</th>
              <th className="p-1 border">Y</th>
              <th className="p-1 border">Type</th>
              <th className="p-1 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id} className="odd:bg-gray-50">
                <td className="p-1 border">{p.name}</td>
                <td className="p-1 border text-right">{p.x}</td>
                <td className="p-1 border text-right">{p.y}</td>
                <td className="p-1 border capitalize">
                  {p.enemy ? 'enemy' : p.ally ? 'ally' : 'neutral'}
                </td>
                <td className="p-1 border">
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {points.length === 0 && (
              <tr>
                <td colSpan="5" className="p-2 text-center text-gray-400">
                  No points added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportJson}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Export List
            </button>
            <button
              type="button"
              onClick={importJson}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
            >
              Import List
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Clear All
            </button>
          </div>
          <textarea
            rows="5"
            className="w-full border rounded p-1"
            placeholder="JSON Data (name|x|y|A|E|N,name|x|y|A|E|N...)"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
          />
           <p className="text-center text-gray-500 text-xs pt-4">Built by Radix</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-xl font-semibold mb-2">Map</h1>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${X_MAX - X_MIN + 1}, minmax(3px, 1fr))`,
            width: 'fit-content',
          }}
        >
          {gridRows}
        </div>
      </div>
    </div>
  );
}
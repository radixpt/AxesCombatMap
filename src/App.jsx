import React, { useState, useMemo } from 'react';
import GridCell from './GridCell'; // ✅ NEW IMPORT

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
    enemy: false,
    hammer: false,
    anvil: false,
  /*
    ally: false,
    defender: false,
    artefact: false,
  */    
  });
  const [jsonData, setJsonData] = useState('');
  const [showNames, setShowNames] = useState(true);

  const pointColorMap = useMemo(() => {
    const map = new Map();
    points.forEach(({ x, y,  enemy, hammer, anvil, defender,ally, name }) => {
      const key = `${x},${y}`;
      let color = 'white';
      if (enemy) color = 'red';
      else if (hammer) color = 'purple';
      else if (anvil) color = "green";
      {/*
      else if (ally) color = 'orange';
      else if (defender) color = 'blue';
      else if (name) color = 'purple'; 
    */}
      map.set(key, { color, name });
    });
    return map;
  }, [points]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (type === 'checkbox') {
        if (name === 'enemy' && checked) {
          return { ...prev, enemy: true, hammer:false , anvil:false , ally: false, defender: false , artefact:false, };
        }
        if (name === 'anvil' && checked) {
          return { ...prev, enemy: false, hammer:false,  anvil:true, ally: false, defender: false  , artefact:false};
        }
        if (name === 'hammer' && checked) {
          return { ...prev, enemy: false, hammer:true, anvil:false, ally: false, defender: false , artefact:false};
        }

        {/*
        if (name === 'ally' && checked) {
          return { ...prev, ally: true, enemy: false, defender: false, anvil:false, artefact:false, hammer:false };
        }

        if (name === 'defender' && checked) {
          return { ...prev, enemy: false, ally: false, defender: true, anvil:false , artefact:false, hammer:false};
        }

        if (name === 'artefact' && checked) {
          return { ...prev, enemy: false, ally: false, defender: false, anvil:false , artefact:true, hammer:false};
        }
        */}



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
        hammer:form.hammer,
        anvil:form.anvil,
        //defender: form.defender,
        //artefact:form.artefact,        
      },
    ]);
    setForm({
      name: '',
      x: '',
      y: '',
      ally: false,
      enemy: false,
      defender: false,
      anvil: false,
      artefact: false,
      hammer: false,
    });
  };

  const handleRemove = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const exportJson = () => {
    const line = points
      .map(
        (p) =>
          `${p.name}|${p.x}|${p.y}|${
            p.ally ? 'A' : p.enemy ? 'E' : p.defender ? 'D' : p.anvil ? 'X' : p.artefact ? 'R' : p.hammer ? "H" : 'N'
          }`
      )
      .join(',');
    setJsonData(line);
  };

  const importJson = (data = jsonData) => {
    try {
      const parsed = data.split(',').map((entry) => {
        const [name, x, y, type] = entry.split('|');
        return {
          id: crypto.randomUUID(),
          name,
          x: parseInt(x, 10),
          y: parseInt(y, 10),
          ally: type === 'A',
          enemy: type === 'E',
          defender: type === 'D',
          anvil: type === "X",
          artefact: type === "R",
          hammer: type === "H",
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
          <GridCell
            key={key}
            color={color}
            title={title}
            name={data?.name}
            showName={showNames}
          />
        );
      }
      rows.push(cells);
    }
    return rows.flat();
  }, [pointColorMap, showNames]);

  return (
    <div className="flex h-screen w-screen font-sans text-sm">
      <div className="w-1/3 min-w-[260px] max-w-md border-r p-4 space-y-4 overflow-y-auto">
        <h1 className="text-xl font-semibold mb-2">Axes Combat Manager</h1>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={showNames}
            onChange={(e) => setShowNames(e.target.checked)}
          />
          Show Player Names
        </label>

        <label className="flex items-center gap-2 mb-2">
          <b>Pre-load data</b>
        </label>

        <button
              type="button"
              onClick={async () => {
                const response = await fetch('/Anvils/AxesAnvils.txt');
                if (response.ok) {
                  const text = await response.text();
                  setJsonData(text);
                  importJson(text);
                } else {
                  alert('Failed to load Anvils data');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Anvils
        </button>
        <br/>      
        <button
              type="button"
              onClick={async () => {
                const response = await fetch('/Hammers/Hammers.txt');
                if (response.ok) {
                  const text = await response.text();
                  setJsonData(text);
                  importJson(text);
                } else {
                  alert('Failed to load Artefacts data');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
            >
              Hammers
        </button>
        {/*
        <br/>      
        <button
              type="button"
              onClick={async () => {
                const response = await fetch('/Artefacts/ArtefactHolders.txt');
                if (response.ok) {
                  const text = await response.text();
                  setJsonData(text);
                  importJson(text);
                } else {
                  alert('Failed to load Artefacts data');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
            >
              Artefacts+Anvils
        </button>
        */}
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
                name="enemy"
                checked={form.enemy}
                onChange={handleChange}
              />
              Enemy
            </label>            
            {/*
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="ally"
                checked={form.ally}
                onChange={handleChange}
              />
              Under Attack
            </label>

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="defender"
                checked={form.defender}
                onChange={handleChange}
              />
              Defender
            </label>
          */}

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="anvil"
                checked={form.anvil}
                onChange={handleChange}
              />
              Anvil
            </label>         
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="hammer"
                checked={form.hammer}
                onChange={handleChange}
              />
              Hammer
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
        <div className="max-h-64 overflow-y-auto border rounded">
          <table className="w-full text-left">
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
                    {p.enemy ? 'enemy' : p.ally ? 'under attack' : p.defender ? 'defender' : p.anvil ? 'anvil' : p.artefact ? 'artefact' : p.hammer ? 'hammer' : 'neutral'}
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
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={exportJson}
              className="bg-yellow-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Export List
            </button>
            <button
              type="button"
              onClick={() => importJson()}
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
            placeholder="JSON Data (name|x|y|A|E|R|N|H,name|x|y|A|E|R|N|H...)"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
          />
        </div>
        <p className="text-center text-gray-500 text-xs pt-4">Built by Radix</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-xl font-semibold mb-2">Map</h1>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${X_MAX - X_MIN + 1}, 10px)`,
            width: `${(X_MAX - X_MIN + 1) * 10}px`,
          }}
        >
          {gridRows}
        </div>
      </div>
    </div>
  );
}

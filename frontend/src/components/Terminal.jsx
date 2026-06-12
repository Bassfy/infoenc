import { useEffect, useRef, useState } from 'react';

const MOTD = `
██╗███╗   ██╗███████╗ ██████╗ ███████╗███╗   ██╗ ██████╗
██║████╗  ██║██╔════╝██╔═══██╗██╔════╝████╗  ██║██╔════╝
██║██╔██╗ ██║█████╗  ██║   ██║█████╗  ██╔██╗ ██║██║
██║██║╚██╗██║██╔══╝  ██║   ██║██╔══╝  ██║╚██╗██║██║
██║██║ ╚████║██║     ╚██████╔╝███████╗██║ ╚████║╚██████╗
╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═══╝ ╚═════╝
`.trim();

const HELP_TEXT = `
Available commands:
  help       - Show this help message
  whoami     - Display current user
  ls         - List files
  cat <file> - Display file contents
  hint       - Request a hint for this challenge
  clear      - Clear terminal
  submit     - Submit a flag (use: submit FLAG{...})
`.trim();

const FAKE_FILES = {
  '.': ['flag.txt.enc', 'README.md', 'hint.txt'],
  'README.md': '# Challenge\nFind the hidden flag in this system.\nThe flag format is: FLAG{...}\n',
  'hint.txt': 'The flag might be encrypted. Look for the key elsewhere...',
};

export default function Terminal({ labSlug, onFlagFound }) {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const addLine = (text, type = 'output') => {
    setLines(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    addLine(MOTD, 'banner');
    addLine('', 'output');
    addLine('Welcome to InfoEnc Hacking Lab Terminal', 'success');
    addLine(`Lab: ${labSlug}`, 'info');
    addLine('Type "help" for available commands.', 'info');
    addLine('', 'output');
  }, [labSlug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const processCommand = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine(`user@infoenc:~$ ${trimmed}`, 'prompt');

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addLine(HELP_TEXT, 'output');
        break;
      case 'whoami':
        addLine('student', 'output');
        break;
      case 'ls':
        addLine(FAKE_FILES['.'].join('  '), 'output');
        break;
      case 'cat':
        if (!args[0]) {
          addLine('Usage: cat <filename>', 'error');
        } else if (FAKE_FILES[args[0]]) {
          addLine(FAKE_FILES[args[0]], 'output');
        } else {
          addLine(`cat: ${args[0]}: No such file or directory`, 'error');
        }
        break;
      case 'hint':
        addLine('Requesting hint...', 'info');
        addLine('Hint: Look at file permissions and hidden directories.', 'warning');
        break;
      case 'clear':
        setLines([]);
        return;
      case 'submit':
        if (!args[0]) {
          addLine('Usage: submit FLAG{...}', 'error');
        } else {
          const flag = args.join(' ');
          addLine(`Submitting flag: ${flag}`, 'info');
          onFlagFound && onFlagFound(flag);
        }
        break;
      case 'pwd':
        addLine('/home/student', 'output');
        break;
      case 'id':
        addLine('uid=1000(student) gid=1000(student) groups=1000(student)', 'output');
        break;
      case 'uname':
        addLine('Linux infoenc-lab 5.15.0 #1 SMP x86_64 GNU/Linux', 'output');
        break;
      default:
        addLine(`bash: ${command}: command not found`, 'error');
    }
    addLine('', 'output');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (cmd) {
        setHistory(prev => [cmd, ...prev].slice(0, 50));
        setHistoryIdx(-1);
      }
      processCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(newIdx);
      setInput(history[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx]);
    }
  };

  const typeColors = {
    banner: 'text-cyber-500 font-mono text-xs leading-tight',
    prompt: 'text-cyber-500 font-mono',
    output: 'text-gray-300 font-mono',
    error: 'text-red-400 font-mono',
    success: 'text-emerald-400 font-mono',
    info: 'text-blue-400 font-mono',
    warning: 'text-yellow-400 font-mono',
  };

  return (
    <div
      className="bg-dark-950 rounded-xl border border-dark-600 overflow-hidden font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border-b border-dark-600">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-gray-500">infoenc-lab — bash</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 h-80 overflow-y-auto">
        {lines.map((line) => (
          <pre key={line.id} className={`whitespace-pre-wrap break-all leading-5 ${typeColors[line.type] || typeColors.output}`}>
            {line.text}
          </pre>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-cyber-500 shrink-0">user@infoenc:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-100 caret-cyber-500 font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

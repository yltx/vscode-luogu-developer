const { default: React } = await import('react');
import './navbar.css';

type Action = {
  id: string;
  label: string;
  checked?: boolean;
  onClick?: () => void;
};

type Props = {
  actions: Action[];
  className?: string;
};

export default function Navbar({ actions, className }: Props) {
  return (
    <div className={className ? `navbar ${className}` : 'navbar'}>
      <div className="action-bar">
        <ul className="actions-container">
          {actions.map(a => (
            <li className="action-item" key={a.id}>
              <button
                className={`action-label ${a.checked ? 'checked' : ''}`}
                onClick={a.onClick}
                aria-pressed={!!a.checked}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

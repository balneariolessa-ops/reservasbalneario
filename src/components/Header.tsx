import { TreePine, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] py-5 px-6 shadow-xl">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md">
            <TreePine className="h-6 w-6 text-[#14532d]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Balneário Lessa
            </h1>
            <p className="text-sm text-[#bbf7d0] font-semibold">
              Sistema de Reservas
            </p>
          </div>
        </div>
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/15 gap-2 font-bold border border-white/20 rounded-xl px-4">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Painel Admin</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;

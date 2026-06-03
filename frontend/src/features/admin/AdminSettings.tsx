
import { Card, Button } from '../../components';
import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <h1 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
        <Settings className="w-6 h-6" />
        System Settings
      </h1>
      <Card className="p-6">
        <p className="text-slate-600">
          This area will host configuration options for the platform (e.g., feature toggles, API keys, environment
          variables, and UI theming). For now it is a placeholder demonstrating the intended layout.
        </p>
        <Button variant="secondary" className="mt-4">
          Add Setting
        </Button>
      </Card>
    </div>
  );
}

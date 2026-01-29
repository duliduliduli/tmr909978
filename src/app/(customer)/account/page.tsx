import { AppShell } from "@/components/AppShell";

export default function CustomerAccountPage() {
  return (
    <AppShell title="Account">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value="Alex Thompson" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value="alex@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Vehicles</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">2022 Tesla Model 3</div>
                <div className="text-sm text-gray-600">White • ABC123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
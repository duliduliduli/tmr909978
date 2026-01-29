import { AppShell } from "@/components/AppShell";

export default function CustomerHelpPage() {
  return (
    <AppShell title="Help & Support">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I book a service?</h3>
              <p className="text-gray-600 text-sm">Tap on any detailer pin on the map, select your preferred service, and choose a time slot.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do coins work?</h3>
              <p className="text-gray-600 text-sm">You earn coins with each service booking. Use coins for discounts on future services.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Support</h2>
          <p className="text-gray-600 mb-4">Need help? We're here for you 24/7.</p>
          <button className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors">
            Chat with Support
          </button>
        </div>
      </div>
    </AppShell>
  );
}
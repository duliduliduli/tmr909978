import { AppShell } from "@/components/AppShell";

export default function DetailerHelpPage() {
  return (
    <AppShell title="Help & Resources">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailer Resources</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How to get more bookings?</h3>
              <p className="text-gray-600 text-sm">Share your QR code, maintain high ratings, and offer competitive pricing.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Managing your coin rewards</h3>
              <p className="text-gray-600 text-sm">Set attractive earn rates and redemption values to encourage repeat customers.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Support</h2>
          <p className="text-gray-600 mb-4">Need help with your business account?</p>
          <button className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors">
            Contact Business Support
          </button>
        </div>
      </div>
    </AppShell>
  );
}
import { AppShell } from "@/components/AppShell";
import { Settings, Clock, MapPin } from "lucide-react";

export default function DetailerAccountPage() {
  return (
    <AppShell title="Business Settings">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" value="Premium Auto Spa" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value="(323) 555-0101" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Working Hours</h2>
          </div>
          <div className="text-gray-600">Mon-Sat 8AM-6PM</div>
          <button className="mt-3 text-teal-600 text-sm font-medium">Edit Hours</button>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Location Privacy (Scatter)</span>
              <button className="bg-teal-500 w-12 h-6 rounded-full relative">
                <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <p className="text-sm text-gray-600">Your exact location will be scattered for privacy</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
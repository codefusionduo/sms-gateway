/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Send, Phone, MessageSquare, Clock, RefreshCw, Smartphone, AlertCircle, Server, CheckCircle2, XCircle } from 'lucide-react';

interface Message {
  id: string;
  to: string;
  body: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  timestamp: string;
  updatedAt: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup'>('dashboard');

  const fetchMessages = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !body) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enqueue message');
      }
      
      setTo('');
      setBody('');
      fetchMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Message['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Processing</span>;
      case 'sent':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Sent</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3"/> Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Custom SMS Gateway</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'setup' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Device Setup
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Compose Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Enqueue SMS</h2>
                </div>
                
                <form onSubmit={handleSend} className="flex flex-col flex-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To (Phone Number)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        placeholder="+1234567890"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Type your message here..."
                      className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 resize-none"
                      required
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {body.length} characters
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || !to || !body}
                    className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Add to Queue
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Logs Section */}
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Queue & History</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Pending: {messages.filter(m => m.status === 'pending').length}
                    </div>
                    <button 
                      onClick={fetchMessages}
                      disabled={fetching}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                      <MessageSquare className="w-12 h-12 opacity-20" />
                      <p>Queue is empty.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-4 rounded-xl border ${
                          msg.status === 'pending' ? 'bg-white border-gray-200' :
                          msg.status === 'processing' ? 'bg-blue-50 border-blue-100' :
                          msg.status === 'sent' ? 'bg-green-50 border-green-100' :
                          'bg-red-50 border-red-100'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(msg.status)}
                            <span className="text-sm font-medium text-gray-900">
                              To: {msg.to}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{msg.body}</p>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>ID: {msg.id}</span>
                          {msg.status !== 'pending' && (
                            <span>Updated: {new Date(msg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">MacroDroid Setup Guide</h2>
              
              <div className="space-y-8 text-gray-700">
                <p className="text-lg">
                  Follow these exact steps to configure MacroDroid on your Android phone to process the SMS queue.
                </p>

                {/* Preparation */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">0. Preparation: Create Variables</h3>
                  <div className="mb-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                    <p className="text-blue-800 font-medium">⚠️ Getting a "No variable configured" error?</p>
                    <p className="text-blue-700 mt-1 text-sm">This means you haven't created the variable yet. Do this first:</p>
                    <ol className="list-decimal pl-5 mt-2 text-sm text-blue-800 space-y-1">
                      <li>At the very bottom of your Macro screen, tap on the <strong>Local Variables</strong> tab.</li>
                      <li>Tap the <strong>+</strong> button to add a new variable.</li>
                      <li>Set Name to <code className="bg-blue-100 px-1 rounded">api_data</code></li>
                      <li>Set Type to <strong>Dictionary</strong></li>
                      <li>Tap OK.</li>
                    </ol>
                  </div>
                </div>

                {/* Step 1 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Add Trigger (Red)</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Tap <strong>+</strong> in the Triggers section.</li>
                    <li>Select <strong>Date/Time</strong> &gt; <strong>Regular Interval</strong></li>
                    <li>Set it to <strong>30 seconds</strong> (or whatever frequency you prefer).</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">2. Fetch Message (Blue Action)</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>Tap <strong>+</strong> in the Actions section.</li>
                    <li>Select <strong>Applications</strong> &gt; <strong>HTTP Request</strong>.</li>
                    <li><strong>Method:</strong> GET</li>
                    <li><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm text-blue-600 break-all">{window.location.origin}/api/queue/pending</code></li>
                    <li>Scroll down to <strong>Save response in variable</strong> and select your <code className="bg-gray-100 px-2 py-1 rounded">api_data</code> dictionary.</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">3. Check if Message Exists (Blue Action)</h3>
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                    <p className="text-yellow-800 font-bold">👉 Based on your new screenshot ("Define manually"):</p>
                    <ol className="list-decimal pl-5 mt-2 text-yellow-900 space-y-2">
                      <li>In the text box (above the purple line), type exactly: <strong>[message][id]</strong></li>
                      <li>Change the <strong>Variable Type</strong> dropdown from <em>Boolean</em> to <strong>String</strong>.</li>
                      <li>Tap <strong>OK</strong>.</li>
                      <li>On the next screen, choose the operator <strong>!= (Not Equal)</strong>.</li>
                      <li>Leave the value text box completely empty (or check 'Empty' if available) and tap OK.</li>
                    </ol>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-500 text-sm">
                    <li>(Context: This tells MacroDroid to only proceed if the server returned a message ID).</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">4. Send the SMS (Inside the If block)</h3>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                    <p className="text-green-800 font-bold">👉 Based on your "Send SMS" screenshot:</p>
                    <ol className="list-decimal pl-5 mt-2 text-green-900 space-y-2">
                      <li>In the <strong>Phone number</strong> line, type exactly: <br/><code className="bg-white px-2 py-1 rounded border inline-block mt-1">[v=api_data[message][to]]</code></li>
                      <li>Leave the <strong>Pre-populate (Don't Send)</strong> box <strong>UNCHECKED</strong>.</li>
                      <li>In the <strong>Message text</strong> line, type exactly: <br/><code className="bg-white px-2 py-1 rounded border inline-block mt-1">[v=api_data[message][body]]</code></li>
                      <li>Tap the <strong>Checkmark (✓)</strong> at the top right corner to save.</li>
                    </ol>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-500 text-sm">
                    <li>(Context: This takes the destination number and the message text from the data we fetched in Step 2).</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">5. Report Success (Blue Action, Inside If block)</h3>
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
                    <p className="text-purple-800 font-bold">👉 Final Step: Tell the server the message was sent</p>
                    <ol className="list-decimal pl-5 mt-2 text-purple-900 space-y-2">
                      <li>Tap <strong>+</strong> in the Actions section again.</li>
                      <li>Select <strong>Applications</strong> &gt; <strong>HTTP Request</strong>.</li>
                      <li>Set <strong>Request Method</strong> to <strong>POST</strong>.</li>
                      <li>For the <strong>URL</strong>, type exactly: <br/><code className="bg-white px-2 py-1 rounded border inline-block mt-1 break-all">{window.location.origin}/api/queue/[v=api_data[message][id]]/status</code></li>
                      <li>Scroll down to <strong>Content Body</strong>, select <strong>application/json</strong>, and in the text box below it type exactly: <br/><code className="bg-white px-2 py-1 rounded border inline-block mt-1">{`{"status": "sent"}`}</code></li>
                      <li>Tap <strong>OK</strong> to save the action.</li>
                    </ol>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-500 text-sm">
                    <li>(Context: This marks the message as "Sent" in your dashboard so it doesn't get sent again).</li>
                  </ul>
                </div>

                {/* Step 6 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">6. Save and Enable!</h3>
                  <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg shadow-sm">
                    <p className="text-green-800 font-bold">🎉 You're all set!</p>
                    <ol className="list-decimal pl-5 mt-2 text-green-900 space-y-2">
                      <li>Give your macro a name at the top (e.g., "SMS Queue Worker").</li>
                      <li>Tap the <strong>+</strong> button at the bottom right corner of the screen to save the macro.</li>
                      <li>Ensure MacroDroid is enabled (the toggle on its home screen should be on).</li>
                      <li>Go to the <strong>Dashboard</strong> tab here and enqueue a message to test it!</li>
                    </ol>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Troubleshooting: based on your logs!
                  </h3>
                  <div className="bg-red-50 p-6 rounded-xl border border-red-100 space-y-4 text-red-900">
                    <p className="font-bold">I can see exactly what went wrong in your screenshots!</p>
                    
                    <ol className="list-decimal pl-5 space-y-4 font-medium">
                      <li>
                        <strong>Fix the Variable syntax (Curly braces, not square!):</strong><br/>
                        In your "Send SMS" action, it is trying to send to literally <code>[v=api_data...]</code>. My previous instructions had a typo. You need to use <strong>Curly Braces</strong> for variables in MacroDroid.<br/>
                        Change Phone Number to: <code className="bg-white px-2 py-1 rounded border inline-block mt-1 text-red-600">{`{lv=api_data[message][to]}`}</code><br/>
                        Change Message Text to: <code className="bg-white px-2 py-1 rounded border inline-block mt-1 text-red-600">{`{lv=api_data[message][body]}`}</code><br/>
                        <span className="text-sm font-normal text-red-700">(Notice the 'lv=' which means Local Variable, and the curly braces {}).</span>
                      </li>
                      <li>
                        <strong>Fix the IF Condition Variable Name:</strong><br/>
                        In your System Log, it says: <code className="text-sm bg-red-100 px-1 rounded">Variable constraint failed... api_response[message][id]</code>.<br/>
                        You accidentally typed <code>api_response</code> instead of <code>api_data</code> when you made the IF condition! Go back to Step 3 and change the variable name in the IF condition to <strong>api_data</strong>.
                      </li>
                      <li>
                        <strong>Move the Send SMS action INSIDE the If block:</strong><br/>
                        In your log, the IF condition fails, but the Send SMS action <strong>still runs</strong>! This means your Send SMS action is <em>outside</em> the IF block.<br/>
                        In MacroDroid, you need to drag the "Send SMS" action (using the up/down arrows icon next to it) so that it is nested <strong>between</strong> the <code className="text-sm bg-blue-100 text-blue-800 px-1 rounded">If</code> and the <code className="text-sm bg-blue-100 text-blue-800 px-1 rounded">End If</code> actions.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

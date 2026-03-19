-- NeXoraBridge.lua (ModuleScript -> ReplicatedStorage)
-- NeXora Ritual Engine - Roblox HTTP bridge

local HttpService = game:GetService("HttpService")

local NeXoraBridge = {}

local BASE_URL = "https://nexora-ritual-worker.mnprtsgg.workers.dev"
local REGION = "other"
local LOW_INTERNET_MODE = false

local batchedLogs = {}

local function SafeHttpRequest(method, url, body)
  local maxRetries = 3
  for i = 1, maxRetries do
    local ok, result = pcall(function()
      if method == "GET" then
        return HttpService:GetAsync(url)
      else
        return HttpService:PostAsync(url, body, Enum.HttpContentType.ApplicationJson)
      end
    end)
    if ok then return true, result end
    if i < maxRetries then task.wait(1) end
  end
  return false, nil
end

function NeXoraBridge.Init(player)
  local userId = tostring(player.UserId)
  local url = BASE_URL .. "/api/prompt?userId=" .. userId
  local ok, response = SafeHttpRequest("GET", url)
  if ok then
    local data = HttpService:JSONDecode(response)
    LOW_INTERNET_MODE = data.lowInternetMode or false
    return data
  end
  return { npcText = "Begin your ritual.", sessionId = HttpService:GenerateGUID(false), lowInternetMode = false }
end

function NeXoraBridge.LogEvent(player, eventType, milestone)
  local payload = HttpService:JSONEncode({
    userId = tostring(player.UserId),
    eventType = eventType,
    timestamp = os.time(),
    elapsed = milestone,
    region = REGION,
  })

  if LOW_INTERNET_MODE then
    table.insert(batchedLogs, payload)
    return
  end

  local url = BASE_URL .. "/api/nexora/log"
  SafeHttpRequest("POST", url, payload)
end

function NeXoraBridge.FlushBatchedLogs(player)
  if #batchedLogs == 0 then return end
  local batch = HttpService:JSONEncode({ events = batchedLogs })
  local url = BASE_URL .. "/api/nexora/log"
  local ok = SafeHttpRequest("POST", url, batch)
  if ok then batchedLogs = {} end
end

function NeXoraBridge.GetStats(player)
  local userId = tostring(player.UserId)
  local url = BASE_URL .. "/api/nexora/stats?userId=" .. userId
  local ok, response = SafeHttpRequest("GET", url)
  if ok then
    return HttpService:JSONDecode(response)
  end
  return { shieldDelta = 0, streak = 0, belt = "White" }
end

return NeXoraBridge

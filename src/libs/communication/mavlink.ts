import { ConnectionManager } from '@/libs/connection/connection-manager'
import type { Message as MavMessage, Package } from '@/libs/connection/m2r/messages/mavlink2rest'

import { MavComponent, MAVLinkType } from '../connection/m2r/messages/mavlink2rest-enum'
import { type Message } from '../connection/m2r/messages/mavlink2rest-message'
import { MavlinkManualControlState } from '../joystick/protocols/mavlink-manual-control'

let lastTimeLoggedConnectionError = new Date(0)

/**
 * Send a mavlink message
 * @param {MavMessage} message
 */
export const sendMavlinkMessage = (message: MavMessage): void => {
  const pack: Package = {
    header: {
      system_id: 255, // GCS system ID
      component_id: Number(MavComponent.MAV_COMP_ID_UDP_BRIDGE), // Used by historical reasons (Check QGC)
      sequence: 0,
    },
    message: message,
  }
  const textEncoder = new TextEncoder()
  try {
    ConnectionManager.write(textEncoder.encode(JSON.stringify(pack)))
  } catch (error) {
    // Don't log the error if it's too frequent
    if (Date.now() < lastTimeLoggedConnectionError.getTime() + 10000) return
    console.error('Error sending MAVLink message:', error)
    lastTimeLoggedConnectionError = new Date()
  }
}

/**
 * Send manual control
 * @param {'MavlinkManualControlState'} controllerState Current state of the controller
 * @param {number} targetId
 */
export const sendManualControl = (controllerState: MavlinkManualControlState, targetId: number): void => {
  const state = controllerState as MavlinkManualControlState
  const manualControlMessage: Message.ManualControl = {
    type: MAVLinkType.MANUAL_CONTROL,
    x: state.x,
    y: state.y,
    z: state.z,
    r: state.r,
    s: state.s,
    t: state.t,
    buttons: state.buttons,
    buttons2: state.buttons2,
    target: targetId,
  }
  sendMavlinkMessage(manualControlMessage)
}

/**
 * Send an RC_CHANNELS_OVERRIDE message with optional channel values.
 * Any channel not specified will be sent as UINT16_MAX (ignore).
 * Values should be in microseconds (1000-2000 typical).
 */
export const sendRcChannelsOverride = (overrides: Partial<Message.RcChannelsOverride>): void => {
  const MAX = 65535
  const msg: Message.RcChannelsOverride = {
    type: MAVLinkType.RC_CHANNELS_OVERRIDE,
    chan1_raw: overrides.chan1_raw ?? MAX,
    chan2_raw: overrides.chan2_raw ?? MAX,
    chan3_raw: overrides.chan3_raw ?? MAX,
    chan4_raw: overrides.chan4_raw ?? MAX,
    chan5_raw: overrides.chan5_raw ?? MAX,
    chan6_raw: overrides.chan6_raw ?? MAX,
    chan7_raw: overrides.chan7_raw ?? MAX,
    chan8_raw: overrides.chan8_raw ?? MAX,
    // required system/component id fields
    target_system: overrides.target_system ?? 1,
    target_component: overrides.target_component ?? 1,
    chan9_raw: overrides.chan9_raw ?? MAX,
    chan10_raw: overrides.chan10_raw ?? MAX,
    chan11_raw: overrides.chan11_raw ?? MAX,
    chan12_raw: overrides.chan12_raw ?? MAX,
    chan13_raw: overrides.chan13_raw ?? MAX,
    chan14_raw: overrides.chan14_raw ?? MAX,
    chan15_raw: overrides.chan15_raw ?? MAX,
    chan16_raw: overrides.chan16_raw ?? MAX,
    chan17_raw: overrides.chan17_raw ?? MAX,
    chan18_raw: overrides.chan18_raw ?? MAX,
  }
  sendMavlinkMessage(msg)
}

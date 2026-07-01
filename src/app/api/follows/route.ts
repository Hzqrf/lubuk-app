// ============================================================
// API ROUTE - Follow User
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { follower_id, following_id } = body;

    if (!follower_id || !following_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create follow
    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id, following_id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create activity event
    await supabase.from('activity_events').insert([
      {
        actor_id: follower_id,
        event_type: 'follow',
        subject_user_id: following_id,
      },
    ]);

    // Create notification
    await supabase.from('notifications').insert([
      {
        recipient_id: following_id,
        actor_id: follower_id,
        event_type: 'follow',
      },
    ]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const follower_id = searchParams.get('follower_id');
    const following_id = searchParams.get('following_id');

    if (!follower_id || !following_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', follower_id)
      .eq('following_id', following_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

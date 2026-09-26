// ============================================================
// API ROUTE - Like/Unlike Catches
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
    const { user_id, catch_id } = body;

    if (!user_id || !catch_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('catch_id', catch_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Create like
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .insert([{ user_id, catch_id }])
      .select()
      .single();

    if (likeError) {
      return NextResponse.json({ error: likeError.message }, { status: 400 });
    }

    // Get catch to find owner
    const { data: catchData } = await supabase
      .from('catches')
      .select('user_id')
      .eq('id', catch_id)
      .single();

    if (catchData) {
      // Create activity event
      await supabase.from('activity_events').insert([
        {
          actor_id: user_id,
          event_type: 'like',
          subject_id: catch_id,
        },
      ]);

      // Create notification (if different user)
      if (catchData.user_id !== user_id) {
        await supabase.from('notifications').insert([
          {
            recipient_id: catchData.user_id,
            actor_id: user_id,
            event_type: 'like',
            catch_id,
          },
        ]);
      }
    }

    return NextResponse.json(like);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const catch_id = searchParams.get('catch_id');

    if (!user_id || !catch_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user_id)
      .eq('catch_id', catch_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// API ROUTE - Comments
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
    const { user_id, catch_id, content } = body;

    if (!user_id || !catch_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long' },
        { status: 400 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{ user_id, catch_id, content }])
      .select()
      .single();

    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 400 });
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
          event_type: 'comment',
          subject_id: catch_id,
        },
      ]);

      // Create notification (if different user)
      if (catchData.user_id !== user_id) {
        await supabase.from('notifications').insert([
          {
            recipient_id: catchData.user_id,
            actor_id: user_id,
            event_type: 'comment',
            catch_id,
          },
        ]);
      }
    }

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comment_id = searchParams.get('comment_id');

    if (!comment_id) {
      return NextResponse.json(
        { error: 'Missing comment_id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

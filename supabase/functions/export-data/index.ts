import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  type: 'attendance' | 'students' | 'grades' | 'users';
  format: 'pdf' | 'excel' | 'csv';
  parameters?: {
    dateFrom?: string;
    dateTo?: string;
    sectionId?: string;
    [key: string]: any;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    const user = userData.user;
    const body: ExportRequest = await req.json();

    // Create export request record
    const { data: exportRequest, error: insertError } = await supabaseClient
      .from("export_requests")
      .insert({
        user_id: user.id,
        export_type: body.type,
        format: body.format,
        parameters: body.parameters || {},
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Log the activity
    await supabaseClient.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email!,
      user_name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      action: `Solicitud de exportación ${body.type}`,
      details: { 
        exportId: exportRequest.id,
        format: body.format,
        parameters: body.parameters 
      }
    });

    // Generate export data based on type
    let data: any[] = [];
    let filename = '';

    switch (body.type) {
      case 'attendance':
        filename = `asistencia_${new Date().toISOString().split('T')[0]}`;
        // Mock attendance data - in real implementation, fetch from database
        data = [
          { fecha: '2024-01-15', estudiante: 'Juan Pérez', seccion: '1°A', presente: 'Sí', tardanza: 'No' },
          { fecha: '2024-01-15', estudiante: 'Ana García', seccion: '1°A', presente: 'No', tardanza: 'No' },
          { fecha: '2024-01-15', estudiante: 'Carlos López', seccion: '1°A', presente: 'Sí', tardanza: 'Sí' }
        ];
        break;

      case 'students':
        filename = `estudiantes_${new Date().toISOString().split('T')[0]}`;
        // Mock student data
        data = [
          { rne: '202300001', nombre: 'Juan', apellido: 'Pérez García', seccion: '1°A', genero: 'Masculino' },
          { rne: '202300002', nombre: 'Ana', apellido: 'García López', seccion: '1°A', genero: 'Femenino' },
          { rne: '202300003', nombre: 'Carlos', apellido: 'López Silva', seccion: '2°B', genero: 'Masculino' }
        ];
        break;

      case 'users':
        filename = `usuarios_${new Date().toISOString().split('T')[0]}`;
        // Check if user is admin
        if (user.user_metadata?.role !== 'admin') {
          throw new Error("Solo los administradores pueden exportar usuarios");
        }
        // Mock user data
        data = [
          { nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'Docente', activo: 'Sí' },
          { nombre: 'Ana García', email: 'ana@ejemplo.com', rol: 'Administrador', activo: 'Sí' },
          { nombre: 'Carlos López', email: 'carlos@ejemplo.com', rol: 'Auxiliar', activo: 'No' }
        ];
        break;

      default:
        throw new Error(`Tipo de exportación no soportado: ${body.type}`);
    }

    // Generate file content based on format
    let fileContent = '';
    let contentType = '';

    switch (body.format) {
      case 'csv':
        contentType = 'text/csv';
        filename += '.csv';
        if (data.length > 0) {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(row => Object.values(row).join(',')).join('\n');
          fileContent = headers + '\n' + rows;
        }
        break;

      case 'excel':
        // For Excel format, we'd typically use a library like xlsx
        // For now, return CSV with Excel mimetype
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename += '.xlsx';
        if (data.length > 0) {
          const headers = Object.keys(data[0]).join('\t');
          const rows = data.map(row => Object.values(row).join('\t')).join('\n');
          fileContent = headers + '\n' + rows;
        }
        break;

      case 'pdf':
        // For PDF, we'd typically use a library like jsPDF or puppeteer
        // For now, return a simple text representation
        contentType = 'application/pdf';
        filename += '.pdf';
        fileContent = `Reporte de ${body.type}\n\nGenerado: ${new Date().toLocaleString()}\n\n` +
                     JSON.stringify(data, null, 2);
        break;

      default:
        throw new Error(`Formato no soportado: ${body.format}`);
    }

    // In a real implementation, you'd upload the file to Supabase Storage
    // For now, we'll simulate the file URL
    const mockFileUrl = `https://ejemplo.com/exports/${exportRequest.id}/${filename}`;

    // Update export request with completion
    await supabaseClient
      .from("export_requests")
      .update({
        status: 'completed',
        file_url: mockFileUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportRequest.id);

    // Return the file content directly for download
    return new Response(fileContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Error in export-data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
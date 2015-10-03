<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">


    <xsl:output method="html" indent="yes" version="1.0"/>

    <xsl:template match="/">
        <table class="REMpg-table">
            <tr>
                <table class="logtable">
                    <xsl:apply-templates/>
                </table>
            </tr>
        </table>

    </xsl:template>

    <xsl:template match="body">
        <xsl:for-each select="header">
            <tr>
                <td rowspan="2">
                    <a href="http://www.d-tacq.com">
                        <img src="images/dtacq.png" alt="DTACQ" id="dtacqlogo"
                             margin="0" padding="0" border="0"
                                />
                    </a>
                </td>
                <td colspan="7" class="REMpg-top-heading">
                    <h1> 
           			ACQ400 UUT Status
                    </h1>
                    by hostname
                </td>
                <td>
                </td>
            </tr>
            <tr>
                <th colspan="4" class="REMpg-div">
                    <xsl:attribute name="style">
                        <xsl:text>text-align: right; padding-right: 4</xsl:text>
                    </xsl:attribute>
                    Local time at Server
                </th>
                <td class="REMpg-td">
                    <xsl:value-of select="substring(.,12,8)"/>                    
                </td>
            </tr>

            <div class="REMpg-div"></div>
            <tr>
                <th>Delay</th>
                <th>Hostname</th>
                <th>Uptime</th>
                <th>T0</th>
                <th>State</th>
                <th>Shot</th>
            </tr>

        </xsl:for-each>
        <xsl:for-each select="record">
            <xsl:choose>
                <xsl:when test="(position() mod 2) = 0">
                    <tr class="oddrow">
                        <xsl:attribute name="style">
                            <xsl:text>background-color: lightblue;</xsl:text>
                        </xsl:attribute>
                        <xsl:apply-templates/>
                    </tr>
                </xsl:when>
                <xsl:when test="(position() mod 2) = 1">
                    <tr class="evenrow">
                        <xsl:apply-templates/>
                    </tr>
                </xsl:when>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>


    <xsl:template match="acq400monitor">
        <xsl:for-each select="@*">
            <td class="REMpg-td">
                <xsl:choose>
                    <xsl:when test="../@dt &gt; 20">
                        <xsl:attribute name="style">
                            <xsl:text>color: red</xsl:text>
                        </xsl:attribute>
                        <xsl:choose>
                            <xsl:when test="../@dt &gt; 60 and position() = 2">
                                <xsl:attribute name="style">
                                    <xsl:text>color: red;</xsl:text>
                                </xsl:attribute>
                                <xsl:text>DOWN</xsl:text>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="."/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="."/>
                    </xsl:otherwise>
                </xsl:choose>
            </td>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="Monitor">
        <xsl:for-each select="*">
            <td class="REMpg-td" colspan="3" align="left">
                <xsl:choose>                    
                    <xsl:otherwise>
                        <xsl:value-of select="."/>
                    </xsl:otherwise>
                </xsl:choose>
            </td>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="info">
        <xsl:for-each select="*">
            <td class="REMpg-td">
                <xsl:attribute name="style">
                    <xsl:text>padding: 2px;</xsl:text>
                </xsl:attribute>
                 <xsl:choose>
			<xsl:when test="position() = 1">
				 <a href="http://{.}/">
				 	<xsl:value-of select="."/>
				 </a>
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="."/>
			</xsl:otherwise>
		 </xsl:choose>

            </td>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="date">
        <xsl:value-of select="substring(.,12,8)"/>
    </xsl:template>
</xsl:stylesheet>


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
                <td rowspan="2" colspan="2">
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
                    <h2>
                    By Hostname
                    </h2>
                </td>
                <td>
                </td>
            </tr>
            <div class="REMpg-div"></div>            
	    	<xsl:apply-templates/>    
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

    <xsl:template match="ts">
	    <tr>		
		<th colspan="4" class="REMpg-div">
		    <xsl:attribute name="style">
			<xsl:text>text-align: right; padding-right: 4</xsl:text>
		    </xsl:attribute>
		    Local time at Server
		</th>
		<td class="REMpg-td">
		    <xsl:value-of select="substring(.,12,9)"/>                    
		</td>
	    </tr>
    </xsl:template>
    
    <xsl:template match="cheads">
	    <tr>
		<xsl:for-each select="./h1">
		    <th>
			<xsl:value-of select="."/>
		    </th>
		</xsl:for-each>		
	    </tr>
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
                            <xsl:when test="../@dt &gt; 120 and position() = 2">
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
            <td class="REMpg-td" colspan="1" align="left">
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

    <xsl:template match="STATE">
	<xsl:attribute name="style">
	<xsl:choose>
		<xsl:when test=". = 0">
			<xsl:text>background-color:pink</xsl:text>
		</xsl:when>
		<xsl:when test=". = 1">
			<xsl:text>background-color:goldenrod</xsl:text>
		</xsl:when>
		<xsl:when test=". = 2">
			<xsl:text>background-color:green</xsl:text>
		</xsl:when>
		<xsl:when test=". = 3">
			<xsl:text>background-color:green</xsl:text>
		</xsl:when>
		<xsl:otherwise>
                        <xsl:text>background-color:cyan</xsl:text>
                </xsl:otherwise>
	</xsl:choose>
	</xsl:attribute>
	<xsl:value-of select="."/>	
    </xsl:template>

   <xsl:template match="TEMP">
	<xsl:attribute name="style">
	<xsl:choose>
		<xsl:when test=". &gt;  60">
			<xsl:text>background-color:red</xsl:text>
		</xsl:when>
		<xsl:when test=". &gt;  55">
			<xsl:text>background-color:orangered</xsl:text>
		</xsl:when>		
		<xsl:otherwise>
                        <xsl:text>background-color:grey</xsl:text>
                </xsl:otherwise>
	</xsl:choose>
	</xsl:attribute>
	<xsl:value-of select="."/>	
    </xsl:template>
    <xsl:template match="date">
        <xsl:value-of select="substring(.,12,8)"/>
    </xsl:template>
</xsl:stylesheet>

